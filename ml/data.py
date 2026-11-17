"""Database-free, deterministic daily export reusing the Data Engineering transforms."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd

from etl.src import transform as t
from ml.contracts import CLASSES, FEATURES

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "etl/data/raw/SSAQS dataset"
DATA = ROOT / "ml/data"


def profile_targets(stress, anxiety):
    stress, anxiety = np.asarray(stress, dtype=float), np.asarray(anxiety, dtype=float)
    if not (np.isfinite(stress).all() and np.isfinite(anxiety).all()):
        raise ValueError("Targets must be finite")
    if ((stress < 0) | (stress > 100) | (anxiety < 0) | (anxiety > 100)).any():
        raise ValueError("Targets must be in [0,100]")
    return np.array(CLASSES)[(stress >= 50).astype(int) * 2 + (anxiety >= 50).astype(int)]


def export_daily(raw: Path = RAW, output: Path = DATA) -> tuple[pd.DataFrame, dict]:
    if not raw.is_dir():
        raise FileNotFoundError(f"Missing SSAQS source: {raw}")
    output.mkdir(parents=True, exist_ok=True)
    source_files = sorted(raw.rglob("*.csv"))
    manifest = {str(p.relative_to(raw)): hashlib.sha256(p.read_bytes()).hexdigest() for p in source_files}
    frames, raw_rows, rejected = [], 0, 0
    transforms = {
        "steps": t.transform_steps, "activity_level": t.transform_activity_level,
        "hrv": t.transform_hrv, "oxygen": t.transform_oxygen,
        "sleep": t.transform_sleep, "stress": t.transform_stress,
    }
    for folder in sorted((p for p in raw.iterdir() if p.is_dir() and p.name.isdigit()), key=lambda p: int(p.name)):
        tables = {}
        for modality, transform in transforms.items():
            path = folder / f"{modality}.csv"
            if not path.exists():
                continue
            frame = pd.read_csv(path)
            raw_rows += len(frame)
            frame["participant_id"] = int(folder.name)
            transformed = transform(frame)
            if modality == "stress":
                rejected += len(transformed[1])
            tables[modality] = transformed[0] if isinstance(transformed, tuple) else transformed
            timestamp = "measurement_date" if modality == "stress" else "timestamp"
            if tables[modality][timestamp].isna().any():
                raise ValueError(f"Unparseable timestamps: {path}")
        sensors = t.aggregate_daily_sensors(**{f"df_{'activity' if k == 'activity_level' else k}": v for k, v in tables.items()})
        # SQL filters only RMSSD aggregates, not the entire HRV table. Correct the
        # existing Python helper's row filtering to reproduce SQL semantics.
        if "hrv" in tables:
            hrv = tables["hrv"].copy()
            hrv["date"] = hrv.timestamp.dt.date
            hrv["valid_rmssd"] = hrv.rmssd.where(hrv.is_valid_rmssd)
            agg = hrv.groupby(["participant_id", "date"]).agg(
                mean_rmssd=("valid_rmssd", "mean"), min_rmssd=("valid_rmssd", "min"),
                max_rmssd=("valid_rmssd", "max"), mean_coverage=("coverage", "mean"),
                mean_low_frequency=("low_frequency", "mean"), mean_high_frequency=("high_frequency", "mean"),
                hrv_reading_count=("rmssd", "size"),
            ).reset_index()
            sensors = sensors.drop(columns=[c for c in agg if c not in ["participant_id", "date"]], errors="ignore")
            sensors = sensors.merge(agg, on=["participant_id", "date"], how="outer", validate="one_to_one")
        if "activity_level" in tables:
            active_dates = set(tables["activity_level"].timestamp.dt.date)
            for col in ["sedentary_minutes", "lightly_active_minutes", "moderately_active_minutes", "very_active_minutes"]:
                if col not in sensors:
                    sensors[col] = np.nan
                sensors.loc[sensors.date.isin(active_dates), col] = sensors.loc[sensors.date.isin(active_dates), col].fillna(0)
        questionnaire = pd.read_csv(folder / "daily_questions.csv")
        raw_rows += len(questionnaire)
        questionnaire["participant_id"] = int(folder.name)
        questions, _ = t.transform_daily_questions(questionnaire)
        if questions.scheduled_at.isna().any():
            raise ValueError("Invalid questionnaire timestamps")
        aligned = t.build_participant_day_dataset(sensors, t.aggregate_daily_questionnaires(questions))
        frames.append(aligned)
    daily = pd.concat(frames, ignore_index=True).sort_values(["participant_id", "date"]).reset_index(drop=True)
    # Match persisted SQL NUMERIC precision before applying midpoint thresholds.
    precision = {"mean_steps_per_min": 2, "mean_rmssd": 3, "mean_coverage": 3,
                 "mean_low_frequency": 3, "mean_high_frequency": 3, "mean_spo2": 1,
                 "sleep_overall_score": 1, "reported_stress_mean": 2, "reported_anxiety_mean": 2}
    for col, digits in precision.items():
        daily[col] = daily[col].round(digits)
    daily["survey_response_count"] = daily.survey_response_count.fillna(0).astype(int)
    if daily.duplicated(["participant_id", "date"]).any():
        raise ValueError("Duplicate participant-day")
    daily.to_csv(output / "daily_features.csv", index=False)
    paired = daily.loc[daily.has_both_modalities].copy()
    paired["profile"] = profile_targets(paired.reported_stress_mean, paired.reported_anxiety_mean)
    # Any-modality DE cohort can include days without the RQ1 input modalities.
    eligible = paired[FEATURES].notna().any(axis=1)
    paired.loc[eligible].to_csv(output / "modeling_daily.csv", index=False)
    info = {
        "source_sha256": manifest, "source_csv_count": len(source_files),
        "participant_sensor_survey_rows_read": raw_rows, "superseded_stress_rows": rejected,
        "daily_rows": len(daily), "paired_rows": len(paired), "modeling_rows": int(eligible.sum()),
        "excluded_no_rq1_features": int((~eligible).sum()),
        "participants": int(daily.participant_id.nunique()),
        "modeling_participants": int(paired.loc[eligible].participant_id.nunique()),
        "daily_sha256": hashlib.sha256((output / "daily_features.csv").read_bytes()).hexdigest(),
        "modeling_sha256": hashlib.sha256((output / "modeling_daily.csv").read_bytes()).hexdigest(),
        "aggregation": "UTC date; questionnaire scheduled date; completed-day retrospective",
        "sql_parity": "Rules matched by inspection, including HRV COUNT(*) and RMSSD-only filtering; live DB comparison unavailable. Numeric rounding uses pandas; exact half ties may differ from PostgreSQL.",
    }
    (output / "manifest.json").write_text(json.dumps(info, indent=2), encoding="utf-8")
    return daily, info


if __name__ == "__main__":
    _, info = export_daily()
    print(json.dumps({k: v for k, v in info.items() if k != "source_sha256"}, indent=2))
