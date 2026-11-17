"""Run with python -m ml.experiment [prepare|audit|split|train|all]."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import platform
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", str(Path(__file__).resolve().parents[1] / ".tools/matplotlib"))

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import GridSearchCV, GroupShuffleSplit, StratifiedGroupKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from ml.contracts import CLASSES, CONTRACT_VERSION, FEATURES, feature_contract, validate_features
from ml.data import DATA, ROOT, export_daily
from ml.inference import decision

OUT = ROOT / "ml/outputs"
SEED = 42


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, allow_nan=False), encoding="utf-8")


def load_data():
    df = pd.read_csv(DATA / "modeling_daily.csv")
    if df.duplicated(["participant_id", "date"]).any():
        raise ValueError("Duplicate participant-days")
    for _, row in df[FEATURES].iterrows():
        validate_features({k: None if pd.isna(v) else float(v) for k, v in row.items()})
    return df


def class_audit(df):
    OUT.mkdir(parents=True, exist_ok=True)
    counts = df.profile.value_counts().reindex(CLASSES, fill_value=0)
    overall = pd.DataFrame({"profile": CLASSES, "count": counts.values, "percent": counts.values / len(df) * 100})
    overall.to_csv(OUT / "class_distribution.csv", index=False)
    per = pd.crosstab(df.participant_id, df.profile).reindex(columns=CLASSES, fill_value=0)
    per.to_csv(OUT / "class_distribution_by_participant.csv")
    per.div(per.sum(axis=1), axis=0).mul(100).to_csv(OUT / "class_percent_by_participant.csv")
    stress, anxiety = df.reported_stress_mean, df.reported_anxiety_mean
    boundary = (stress - 50).abs().combine((anxiety - 50).abs(), np.minimum)
    info = {
        "threshold": "<50 low; >=50 high; daily means rounded to 2 decimals",
        "overall": overall.to_dict(orient="records"),
        "participants_per_class": (per > 0).sum().to_dict(),
        "exactly_50_either_score": int(((stress == 50) | (anxiety == 50)).sum()),
        "within_5_either_score_inclusive": int((boundary <= 5).sum()),
        "within_10_either_score_inclusive": int((boundary <= 10).sum()),
        "feature_missing_percent": (df[FEATURES].isna().mean() * 100).to_dict(),
    }
    write_json(OUT / "class_audit.json", info)
    private = OUT / "predictions"
    private.mkdir(exist_ok=True)
    df.loc[boundary <= 5, ["participant_id", "date", "reported_stress_mean", "reported_anxiety_mean", "profile"]].to_csv(private / "boundary_cases.csv", index=False)
    lines = ["# Class and boundary audit", "", info["threshold"], "", "| Profile | Count | Percent | Participants |", "|---|---:|---:|---:|"]
    for row in info["overall"]:
        lines.append(f"| {row['profile']} | {row['count']} | {row['percent']:.2f}% | {info['participants_per_class'][row['profile']]} |")
    lines += ["", f"Exactly 50 on either score: {info['exactly_50_either_score']}; within ±5: {info['within_5_either_score_inclusive']}; within ±10: {info['within_10_either_score_inclusive']}.", "", "These thresholds operationalize research profiles, not clinical diagnoses. Minority participant support limits fold reliability."]
    (OUT / "CLASS_AUDIT.md").write_text("\n".join(lines), encoding="utf-8")
    return info


def create_splits(df):
    path = OUT / "splits/split_manifest.json"
    data_hash = hashlib.sha256((DATA / "modeling_daily.csv").read_bytes()).hexdigest()
    if path.exists():
        frozen = json.loads(path.read_text())
        if frozen["data_sha256"] != data_hash:
            raise ValueError("Dataset changed: use a new experiment output directory/version rather than overwrite frozen split")
        train, test = np.array(frozen["development_indices"]), np.array(frozen["test_indices"])
        folds = [(np.array(f["train"]), np.array(f["validation"])) for f in frozen["cv_folds"]]
        return train, test, folds, frozen
    train, test = next(GroupShuffleSplit(n_splits=1, test_size=0.25, random_state=SEED).split(df, groups=df.participant_id))
    dev = df.iloc[train]
    folds = list(StratifiedGroupKFold(n_splits=3, shuffle=True, random_state=SEED).split(dev[FEATURES], dev.profile, dev.participant_id))
    assert not set(dev.participant_id) & set(df.iloc[test].participant_id)
    for fit, val in folds:
        assert not set(dev.iloc[fit].participant_id) & set(dev.iloc[val].participant_id)
        if set(dev.iloc[fit].profile) != set(CLASSES):
            raise ValueError("A development training fold lacks a class. Revisit protocol before training.")
    if set(dev.profile) != set(CLASSES):
        raise ValueError("Development split lacks a class")
    frozen = {
        "seed": SEED, "data_sha256": data_hash, "protocol": "One fixed 25% participant test split; three stratified grouped development folds",
        "development_indices": train.tolist(), "test_indices": test.tolist(),
        "development_participants": sorted(map(int, dev.participant_id.unique())),
        "test_participants": sorted(map(int, df.iloc[test].participant_id.unique())),
        "cv_folds": [{"train": a.tolist(), "validation": b.tolist()} for a, b in folds],
        "cv_index_space": "Positions in development_indices; no test samples used for tuning",
        "split_class_counts": {name: df.iloc[idx].profile.value_counts().reindex(CLASSES, fill_value=0).to_dict() for name, idx in [("development", train), ("test", test)]},
    }
    write_json(path, frozen)
    assignment = df[["participant_id", "date"]].copy()
    assignment["split"] = "development"
    assignment.loc[test, "split"] = "test"
    assignment.to_csv(path.parent / "assignments.csv", index_label="row_index")
    return train, test, folds, frozen


def metrics(y, pred):
    return {
        "macro_f1": f1_score(y, pred, labels=CLASSES, average="macro", zero_division=0),
        "weighted_f1": f1_score(y, pred, labels=CLASSES, average="weighted", zero_division=0),
        "accuracy": accuracy_score(y, pred),
        "classification_report": classification_report(y, pred, labels=CLASSES, target_names=CLASSES, output_dict=True, zero_division=0),
        "confusion_matrix": confusion_matrix(y, pred, labels=CLASSES).tolist(),
    }


def macro_f1_scorer(estimator, x, y):
    return f1_score(y, estimator.predict(x), labels=CLASSES, average="macro", zero_division=0)


def ordered_probabilities(model, x):
    raw = model.predict_proba(x)
    return np.column_stack([raw[:, list(model.classes_).index(c)] if c in model.classes_ else np.zeros(len(x)) for c in CLASSES])


def select_policy(y, probs, missing):
    # OOF development predictions only. Threshold targets are engineering criteria,
    # not a safety guarantee; predictions are explicitly uncalibrated.
    predicted = np.array(CLASSES)[probs.argmax(axis=1)]
    confidence = probs.max(axis=1)
    sorted_p = np.sort(probs, axis=1)
    margin = sorted_p[:, -1] - sorted_p[:, -2]
    options = []
    for threshold in [0.5, 0.6, 0.7, 0.8, 0.9, 0.95]:
        for gap in [0.1, 0.2, 0.3]:
            accepted = (confidence >= threshold) & (margin >= gap) & (missing <= 0.5)
            n = int(accepted.sum())
            accuracy = float(np.mean(predicted[accepted] == np.asarray(y)[accepted])) if n else None
            options.append({"threshold": threshold, "margin": gap, "n": n, "coverage": n / len(y), "accuracy": accuracy})
    feasible = [r for r in options if r["n"] >= max(30, int(len(y) * .1)) and r["accuracy"] >= .7]
    best = max(feasible, key=lambda r: (r["coverage"], r["accuracy"], r["threshold"], r["margin"])) if feasible else None
    policy = {"confidence_threshold": best["threshold"] if best else 1.01,
              "margin_threshold": best["margin"] if best else 1.0, "max_missing_fraction": .5,
              "selection": "Development OOF target accuracy>=0.70 and coverage>=10% (minimum 30); else abstain all",
              "probabilities_calibrated": False, "development_estimate_optimistic": "Hyperparameters and thresholds share development CV; final test is independent."}
    return policy, options


def save_confusion(name, result):
    cm = np.array(result["confusion_matrix"])
    pd.DataFrame(cm, index=pd.Index(CLASSES, name="true_profile"), columns=CLASSES).to_csv(OUT / f"confusion_{name}.csv")
    fig, ax = plt.subplots(figsize=(4.4, 3.8), constrained_layout=True)
    im = ax.imshow(cm, cmap="Blues")
    ax.set(xticks=range(4), yticks=range(4), xticklabels=CLASSES, yticklabels=CLASSES, xlabel="Predicted profile", ylabel="True profile", title=name.replace("_", " "))
    for (i, j), value in np.ndenumerate(cm):
        ax.text(j, i, str(value), ha="center", va="center", color="white" if value > cm.max() / 2 else "black")
    fig.colorbar(im, ax=ax, shrink=.8)
    fig.savefig(OUT / f"confusion_{name}.png", dpi=300)
    fig.savefig(OUT / f"confusion_{name}.pdf")
    plt.close(fig)


def train(df, train_idx, test_idx, folds, frozen):
    OUT.mkdir(parents=True, exist_ok=True)
    x, y = df[FEATURES], df.profile
    xdev, ydev = x.iloc[train_idx], y.iloc[train_idx]
    configs = {
        "majority": (DummyClassifier(strategy="most_frequent"), {}),
        "logistic_standard": (LogisticRegression(max_iter=3000, random_state=SEED), {"model__C": [.01, .1, 1, 10]}),
        "logistic_balanced": (LogisticRegression(max_iter=3000, random_state=SEED, class_weight="balanced"), {"model__C": [.01, .1, 1, 10]}),
        "forest_standard": (RandomForestClassifier(n_estimators=200, random_state=SEED, n_jobs=1), {"model__max_depth": [6, None], "model__min_samples_leaf": [2, 5]}),
        "forest_balanced": (RandomForestClassifier(n_estimators=200, random_state=SEED, n_jobs=1, class_weight="balanced"), {"model__max_depth": [6, None], "model__min_samples_leaf": [2, 5]}),
    }
    searches, models, oof = {}, {}, {}
    for name, (model, grid) in configs.items():
        print(f"Tuning {name} on development participants only", flush=True)
        pipe = Pipeline([("imputer", SimpleImputer(strategy="median", add_indicator=True, keep_empty_features=True)),
                         ("scaler", StandardScaler()), ("model", model)])
        search = GridSearchCV(pipe, grid, scoring=macro_f1_scorer, cv=folds, n_jobs=1, error_score="raise", return_train_score=False)
        search.fit(xdev, ydev)
        models[name] = search.best_estimator_
        searches[name] = {"mean_cv_macro_f1": float(search.best_score_), "best_params": search.best_params_,
                          "std_cv_macro_f1": float(search.cv_results_["std_test_score"][search.best_index_])}
        pd.DataFrame(search.cv_results_).to_csv(OUT / f"search_{name}.csv", index=False)
        raw_oof = cross_val_predict(models[name], xdev, ydev, cv=folds, method="predict_proba", n_jobs=1)
        oof[name] = raw_oof[:, [list(models[name].classes_).index(c) for c in CLASSES]]
        oof_metrics = metrics(ydev, np.array(CLASSES)[oof[name].argmax(axis=1)])
        searches[name]["oof_per_class_recall"] = {c: oof_metrics["classification_report"][c]["recall"] for c in CLASSES}
    # Winner fixed BEFORE evaluating any final-test metrics. Ties favor simpler models.
    selected = max(configs, key=lambda name: (searches[name]["mean_cv_macro_f1"], min(searches[name]["oof_per_class_recall"].values())))
    policy, policy_grid = select_policy(ydev, oof[selected], xdev.isna().mean(axis=1).to_numpy())
    write_json(OUT / "development_selection.json", {"selected": selected, "candidates": searches, "policy": policy, "policy_search": policy_grid})
    results, errors = {}, {}
    private = OUT / "predictions"
    private.mkdir(exist_ok=True)
    for name, model in models.items():
        probs = ordered_probabilities(model, x.iloc[test_idx])
        pred = np.array(CLASSES)[probs.argmax(axis=1)]
        results[name] = {**metrics(y.iloc[test_idx], pred), **searches[name]}
        save_confusion(name, results[name])
        records = df.iloc[test_idx][["participant_id", "date", "profile", "reported_stress_mean", "reported_anxiety_mean"]].copy()
        records["prediction"] = pred
        records["confidence"] = probs.max(axis=1)
        records["near_boundary"] = ((records.reported_stress_mean - 50).abs() <= 5) | ((records.reported_anxiety_mean - 50).abs() <= 5)
        records["correct"] = pred == records.profile
        for i, label in enumerate(CLASSES):
            records[f"p_{label}"] = probs[:, i]
        records.to_csv(private / f"test_{name}.csv", index=False)
        confusion_pairs = records.loc[~records.correct].groupby(["profile", "prediction"]).size().sort_values(ascending=False)
        errors[name] = {
            "most_confused": [{"true": a, "predicted": b, "count": int(n)} for (a, b), n in confusion_pairs.head(5).items()],
            "boundary_n": int(records.near_boundary.sum()),
            "boundary_error_rate": float((~records.loc[records.near_boundary, "correct"]).mean()) if records.near_boundary.any() else None,
            "nonboundary_error_rate": float((~records.loc[~records.near_boundary, "correct"]).mean()) if (~records.near_boundary).any() else None,
            "participant_metrics": [{"participant_id": int(pid), **{k: metrics(g.profile, g.prediction)[k] for k in ["macro_f1", "accuracy"]}, "n": len(g)} for pid, g in records.groupby("participant_id")],
        }
    selected_model = models[selected]
    probabilities = ordered_probabilities(selected_model, x.iloc[test_idx])
    decisions = [decision(p, m, policy) for p, m in zip(probabilities, x.iloc[test_idx].isna().mean(axis=1))]
    accepted = np.array([not d["is_uncertain"] for d in decisions])
    uncertainty = {"test_coverage": float(accepted.mean()), "accepted_n": int(accepted.sum()),
                   "accepted_accuracy": float(np.mean(np.array(CLASSES)[probabilities.argmax(axis=1)][accepted] == y.iloc[test_idx].to_numpy()[accepted])) if accepted.any() else None,
                   "missing_evidence_n": sum(d["evidence_status"] == "missing_evidence" for d in decisions)}
    write_json(private / "selected_test_decisions.json", decisions)
    importance_names = selected_model[:-1].get_feature_names_out()
    estimator = selected_model["model"]
    if hasattr(estimator, "coef_"):
        importance = pd.DataFrame(estimator.coef_.T, index=importance_names, columns=estimator.classes_)
        importance["mean_absolute_coefficient"] = importance.abs().mean(axis=1)
    elif hasattr(estimator, "feature_importances_"):
        importance = pd.DataFrame({"impurity_importance": estimator.feature_importances_}, index=importance_names)
    else:
        importance = pd.DataFrame({"importance": np.zeros(len(importance_names))}, index=importance_names)
    importance.index.name = "feature"
    importance.to_csv(OUT / "selected_feature_importance.csv")
    # Group bootstrap captures between-participant variation in final-test performance.
    rng = np.random.default_rng(SEED)
    test_frame = df.iloc[test_idx]
    point_predictions = np.array(CLASSES)[probabilities.argmax(axis=1)]
    ids = test_frame.participant_id.to_numpy()
    boot = []
    for _ in range(1000):
        sampled = rng.choice(np.unique(ids), len(np.unique(ids)), replace=True)
        positions = np.concatenate([np.flatnonzero(ids == pid) for pid in sampled])
        boot.append(f1_score(y.iloc[test_idx].to_numpy()[positions], point_predictions[positions], labels=CLASSES, average="macro", zero_division=0))
    interval = np.quantile(boot, [.025, .975]).tolist()
    write_json(OUT / "metrics.json", {"classes": CLASSES, "selected": selected, "models": results, "uncertainty": uncertainty, "selected_macro_f1_participant_bootstrap_95ci": interval})
    write_json(OUT / "error_analysis.json", errors)
    version = "1.0.0-" + frozen["data_sha256"][:12]
    artifact = {"pipeline": selected_model, "features": FEATURES, "classes": CLASSES, "contract_version": CONTRACT_VERSION,
                "model_version": version, "policy": policy, "selected_model": selected, "data_sha256": frozen["data_sha256"],
                "training_participants": frozen["development_participants"], "sklearn_version": sklearn.__version__}
    model_dir = ROOT / "models"
    model_dir.mkdir(exist_ok=True)
    joblib.dump(artifact, model_dir / f"studysense_profile_classifier_{version}.joblib")
    joblib.dump(artifact, model_dir / "studysense_profile_classifier.joblib")
    write_json(OUT / "feature_contract.json", feature_contract())
    write_json(OUT / "prediction_contract.json", {
        "version": CONTRACT_VERSION, "predicted_profile": CLASSES + [None],
        "probabilities": {label: "number [0,1], or null when missing_evidence" for label in CLASSES},
        "confidence_score": "maximum uncalibrated class probability; 0 when missing_evidence",
        "is_uncertain": "boolean", "evidence_status": ["confident", "uncertain", "missing_evidence"],
        "fallback_recommendation": ["proceed", "clarify_or_defer"],
        "additional": ["model_version", "contract_version", "missing_features"],
        "invalid_input": "ValueError; caller must clarify/defer rather than intervene",
    })
    environment = {"python": platform.python_version(), "numpy": np.__version__, "pandas": pd.__version__, "scikit_learn": sklearn.__version__, "joblib": joblib.__version__, "matplotlib": matplotlib.__version__}
    write_json(OUT / "environment.json", environment)
    # uv environments need not contain pip; record all installed exact versions.
    from importlib.metadata import distributions
    (ROOT / "ml/requirements-lock.txt").write_text("\n".join(sorted(f"{d.metadata['Name']}=={d.version}" for d in distributions() if d.metadata['Name'])) + "\n", encoding="utf-8")
    write_report(df, frozen, results, selected, errors, uncertainty, policy, interval, environment, importance)
    print(json.dumps({"selected": selected, "test_macro_f1": results[selected]["macro_f1"], "uncertainty": uncertainty}, indent=2), flush=True)


def write_report(df, split, results, selected, errors, uncertainty, policy, interval, env, importance):
    manifest = json.loads((DATA / "manifest.json").read_text())
    audit = json.loads((OUT / "class_audit.json").read_text())
    lines = ["# StudySense RQ1 ML Evaluation Report", "", "RQ1: Can wearable features predict four daily stress-anxiety profiles?", "",
             "## Scope and reproducibility", "", "This is retrospective classification of completed UTC days in SSAQS, not prospective forecasting, real-time intervention, clinical diagnosis, or causal inference.",
             f"Source: {manifest['source_csv_count']} CSVs; {manifest['daily_rows']} participant-days; {manifest['paired_rows']} paired days; {len(df)} eligible modeling days from {df.participant_id.nunique()} participants. {manifest['excluded_no_rq1_features']} paired days excluded for no RQ1 inputs.",
             "Raw SHA256 hashes, export hashes and aggregation details are in the local ml/data/manifest.json. No database credentials are required. SQL parity was checked by code inspection, not against a live database. The Python HRV helper filters all HRV rows by RMSSD validity; this exporter instead matches SQL by filtering only RMSSD summaries. UTC dates preserve the existing ETL convention; local-calendar alignment is a sensitivity analysis still to do.",
             "", "## Target and class audit", "", "Daily questionnaire means define LSLA (<50,<50), LSHA (<50,>=50), HSLA (>=50,<50), HSHA (>=50,>=50). Exactly 50 is High. These operational thresholds are not clinical cutoffs.", "", "| Class | Rows | Percent | Participants |", "|---|---:|---:|---:|"]
    for row in audit["overall"]:
        lines.append(f"| {row['profile']} | {row['count']} | {row['percent']:.2f} | {audit['participants_per_class'][row['profile']]} |")
    lines += ["", f"Boundary audit: {audit['exactly_50_either_score']} days with either mean exactly 50; {audit['within_5_either_score_inclusive']} within ±5; {audit['within_10_either_score_inclusive']} within ±10.",
              "", "## Participant-aware protocol", "", f"Seed {SEED}; fixed GroupShuffleSplit test fraction 25% of participants. Development: {len(split['development_indices'])} days, {len(split['development_participants'])} participants; test: {len(split['test_indices'])} days, {len(split['test_participants'])} participants. Zero participant overlap. Three StratifiedGroupKFold development folds; identical folds for every candidate.",
              "All median imputation (including missingness indicators) and standardization are fitted inside each training fold. No participant IDs, dates, questionnaire summaries, survey counts, SpO2 or proprietary Fitbit stress scores are predictors. No rolling/forward-fill features or observations from another day are used. Full-day features are only valid after that day closes; the split evaluates unseen participants in the same study period, not future-period generalization.",
              "LR tests C={0.01,0.1,1,10}, separately standard and balanced weights. RF uses 200 trees, max_depth={6,None}, min_samples_leaf={2,5}, separately standard and balanced weights. Macro-F1 over the fixed four classes is the selection metric. Scores for absent classes use zero_division=0. The winner is frozen from development CV before test metrics are computed; test results must not be used to retune.",
              "", "## Results on unseen test participants", "", "| Model | CV macro-F1 | Test macro-F1 | Weighted-F1 | Accuracy |", "|---|---:|---:|---:|---:|"]
    for name, r in results.items():
        lines.append(f"| {name} | {r['mean_cv_macro_f1']:.4f} | {r['macro_f1']:.4f} | {r['weighted_f1']:.4f} | {r['accuracy']:.4f} |")
    lines += ["", f"Selected by development CV: **{selected}**. Selected test Macro-F1 participant-bootstrap percentile 95% interval: [{interval[0]:.4f}, {interval[1]:.4f}] (1,000 resamples of test participants; few clusters limit precision).", "", "| Model | Class | Precision | Recall | F1 | Support |", "|---|---|---:|---:|---:|---:|"]
    for name, r in results.items():
        for c in CLASSES:
            m = r["classification_report"][c]
            lines.append(f"| {name} | {c} | {m['precision']:.4f} | {m['recall']:.4f} | {m['f1-score']:.4f} | {m['support']:.0f} |")
    lines += ["", "Confusion matrices use rows=true and columns=predicted in LSLA, LSHA, HSLA, HSHA order. Each model has CSV, 300-dpi PNG and vector PDF outputs in ml/outputs; structured matrices are in metrics.json.", "", "## Error analysis", ""]
    for name, error in errors.items():
        lines += [f"### {name}", "", f"Most common confusions: {json.dumps(error['most_confused'])}", f"Boundary (±5 either mean) error rate: {error['boundary_error_rate']}; nonboundary: {error['nonboundary_error_rate']}. Boundary n={error['boundary_n']}.", ""]
    lines += ["Participant-specific accuracy/Macro-F1 are in error_analysis.json. Minority-class and participant heterogeneity must be considered alongside aggregate accuracy. Per-participant macro-F1 includes all four classes even if a participant does not exhibit them.", "", "## Interpretability", "", "Selected feature coefficients/importances, including missingness indicators, are in selected_feature_importance.csv. LR coefficients are for standardized inputs; RF impurity importances are descriptive, correlated-feature-sensitive and not causal. Dummy importance values carry no interpretation.", "", "Top features by mean absolute coefficient or impurity importance:", ""]
    rank_col = "mean_absolute_coefficient" if "mean_absolute_coefficient" in importance else importance.columns[0]
    for feature, value in importance[rank_col].sort_values(ascending=False).head(10).items():
        lines.append(f"- {feature}: {value:.6f}")
    lines += ["", "## Uncertainty and fallback", "", f"Policy: `{json.dumps(policy)}`", f"Final-test fallback results: `{json.dumps(uncertainty)}`", "Thresholds are selected using development OOF predictions and a minimum acceptance accuracy of 70%, with minimum coverage 10% and 30 accepted cases. If no policy meets these criteria, all predictions defer. This criterion is an engineering choice, not demonstrated safety. OOF hyperparameters were selected using the same development folds, so these development estimates are optimistic; final-test reporting remains independent. Probabilities are uncalibrated and must not be interpreted as clinical confidence. Missing more than half of the 17 inputs yields missing_evidence and null prediction/probabilities. Other uncertain rows retain their candidate profile while recommending clarify_or_defer.",
              "", "## Inference handoff", "", "```python", "from ml.inference import predict_profile", "result = predict_profile(wearable_features_dict)", "```", "", "Feature and output schemas are in feature_contract.json and prediction_contract.json. Inputs must use the exact 17 allowlisted keys; omitted values/JSON null represent missing data. Unknown fields, booleans, strings, nonfinite numbers and out-of-range values raise ValueError; callers must defer on invalid input. Outputs include predicted_profile, probabilities, confidence_score, is_uncertain, evidence_status, fallback_recommendation, missing_features, model_version and contract_version. Never load untrusted joblib files.",
              "", "## RQ1 interpretation and limitations", ""]
    selected_score, baseline_score = results[selected]["macro_f1"], results["majority"]["macro_f1"]
    lines += [f"The development-selected model achieves test Macro-F1 {selected_score:.4f}, versus majority baseline {baseline_score:.4f}. This {'exceeds' if selected_score > baseline_score else 'does not exceed'} the majority baseline in this fixed split; it does not establish reliable recognition of all four profiles. Assess per-class recalls above before making that claim.",
              "One small cohort and one held-out participant split limit generalization. No external validation, prospective evaluation, clinical validation, or probability calibration was performed. Daily mean thresholding can hide within-day variation. Rare profiles and participant-level label concentration can destabilize evaluation. Test participants were not selected to guarantee class balance. More repeated/nested grouped evaluation and calibration on independent participants would strengthen evidence; do not use this test set to optimize subsequent variants.",
              "", "## Reproduction", "", "```powershell", ".venv/Scripts/python.exe -m ml.experiment all", ".venv/Scripts/python.exe -m pytest ml/tests -q", "```", "", "Install ml/requirements-lock.txt for the exact environment. Frozen row indices and development folds are under local ml/outputs/splits; input hashes prevent silently reusing splits with changed data. Participant-level exports/predictions and model binaries are gitignored. The selected artifact is fitted only on development participants, preserving the independent test set.", f"Environment: `{json.dumps(env)}`", "", "## Verification", "", "Automated test results are recorded separately in ml/outputs/test-results.txt after the run."]
    (ROOT / "ML_EVALUATION_REPORT.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("stage", choices=["prepare", "audit", "split", "train", "all"], default="all", nargs="?")
    args = parser.parse_args()
    if args.stage in ["prepare", "all"]:
        _, info = export_daily()
        print(f"Exported {info['daily_rows']} daily and {info['modeling_rows']} modeling rows", flush=True)
    if args.stage == "prepare":
        return
    df = load_data()
    if args.stage in ["audit", "all"]:
        print(json.dumps(class_audit(df), indent=2), flush=True)
    if args.stage == "audit":
        return
    train_idx, test_idx, folds, frozen = create_splits(df)
    print(f"Frozen split: {len(train_idx)} development / {len(test_idx)} test days", flush=True)
    if args.stage in ["train", "all"]:
        train(df, train_idx, test_idx, folds, frozen)


if __name__ == "__main__":
    main()
