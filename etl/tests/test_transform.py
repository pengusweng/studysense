import datetime
import pytest
import pandas as pd
import numpy as np

from src.transform import (
    to_snake_case,
    standardize_column_names,
    trim_and_standardize_strings,
    parse_unix_epoch_to_utc,
    parse_iso_timestamp_to_utc,
    parse_us_date,
    parse_time_string,
    handle_sentinel_timestamps,
    clean_stress_failures,
    flag_zero_rmssd,
    flag_coverage_overcount,
    flag_spo2_artifacts,
    flag_step_anomalies,
    deduplicate_stress_updates,
    transform_course_details,
    transform_users_courses,
    transform_daily_questions,
    transform_stress,
    aggregate_daily_sensors,
    aggregate_daily_questionnaires,
    build_participant_day_dataset
)


# -----------------------------------------------------------------------------
# 1. Column Naming & String Standardization Tests
# -----------------------------------------------------------------------------

def test_to_snake_case():
    assert to_snake_case("timeStampScheduled") == "time_stamp_scheduled"
    assert to_snake_case("CALCULATION_FAILED") == "calculation_failed"
    assert to_snake_case("STRESS_SCORE") == "stress_score"
    assert to_snake_case("startDate") == "start_date"
    assert to_snake_case("idcourse") == "idcourse"
    assert to_snake_case("low_frequency") == "low_frequency"


def test_standardize_column_names():
    df = pd.DataFrame(columns=["timeStampSent", "STRESS_SCORE", "level"])
    out = standardize_column_names(df, rename_map={"level": "activity_level"})
    assert list(out.columns) == ["time_stamp_sent", "stress_score", "activity_level"]


def test_trim_and_standardize_strings():
    s = pd.Series(["  Sedentary ", "lightly_active  ", "  ", None, np.nan])
    out = trim_and_standardize_strings(s, uppercase=True)
    assert out.iloc[0] == "SEDENTARY"
    assert out.iloc[1] == "LIGHTLY_ACTIVE"
    assert pd.isna(out.iloc[2])
    assert pd.isna(out.iloc[3])
    assert pd.isna(out.iloc[4])


# -----------------------------------------------------------------------------
# 2. Date, Time & Timestamp Parsing Tests
# -----------------------------------------------------------------------------

def test_parse_unix_epoch_to_utc():
    # 1739999335 -> 2025-02-19 21:08:55 UTC
    s = pd.Series([1739999335, "1740082074", 0, np.nan])
    out = parse_unix_epoch_to_utc(s)
    assert str(out.iloc[0]) == "2025-02-19 21:08:55+00:00"
    assert str(out.iloc[1]) == "2025-02-20 20:07:54+00:00"
    assert pd.isna(out.iloc[2])  # Sentinel 0 becomes NaT
    assert pd.isna(out.iloc[3])


def test_parse_iso_timestamp_to_utc():
    s = pd.Series(["2025-02-21T12:58:00Z", "2025-02-23T00:00:00", "invalid"])
    out = parse_iso_timestamp_to_utc(s)
    assert str(out.iloc[0]) == "2025-02-21 12:58:00+00:00"
    assert str(out.iloc[1]) == "2025-02-23 00:00:00+00:00"
    assert pd.isna(out.iloc[2])


def test_parse_us_date():
    s = pd.Series(["2/10/2025", "6/15/2025", "invalid"])
    out = parse_us_date(s)
    assert out.iloc[0] == datetime.date(2025, 2, 10)
    assert out.iloc[1] == datetime.date(2025, 6, 15)
    assert pd.isna(out.iloc[2])


def test_parse_time_string():
    s = pd.Series(["7:00", "17:30", "09:00", None])
    out = parse_time_string(s)
    assert out.iloc[0] == datetime.time(7, 0)
    assert out.iloc[1] == datetime.time(17, 30)
    assert out.iloc[2] == datetime.time(9, 0)
    assert out.iloc[3] is None


# -----------------------------------------------------------------------------
# 3. Sentinel & Impossible Value Tests
# -----------------------------------------------------------------------------

def test_handle_sentinel_timestamps():
    s = pd.Series([0, 1740773416, 0, "0", 1740861387])
    cleaned, is_resent = handle_sentinel_timestamps(s, sentinel_val=0)
    assert pd.isna(cleaned.iloc[0])
    assert not is_resent.iloc[0]
    assert cleaned.iloc[1] == 1740773416
    assert is_resent.iloc[1]
    assert pd.isna(cleaned.iloc[2])
    assert not is_resent.iloc[2]


def test_clean_stress_failures():
    df = pd.DataFrame({
        "stress_score": ["0", "58", "0", "75"],
        "calculation_failed": ["True", "False", "true", "false"]
    })
    out, nullified_count = clean_stress_failures(df)
    assert nullified_count == 2
    assert pd.isna(out["stress_score"].iloc[0])
    assert out["stress_score"].iloc[1] == 58.0
    assert pd.isna(out["stress_score"].iloc[2])
    assert out["stress_score"].iloc[3] == 75.0
    assert out["calculation_failed"].tolist() == [True, False, True, False]


def test_flag_zero_rmssd():
    df = pd.DataFrame({"rmssd": [0.0, 45.2, 0.0, 120.5]})
    out, count = flag_zero_rmssd(df)
    assert count == 2
    assert out["is_valid_rmssd"].tolist() == [False, True, False, True]
    # Verify no value imputation
    assert out["rmssd"].tolist() == [0.0, 45.2, 0.0, 120.5]


def test_flag_coverage_overcount():
    df = pd.DataFrame({"coverage": [0.85, 1.0, 1.056, 0.92]})
    out, count = flag_coverage_overcount(df)
    assert count == 1
    assert out["is_coverage_overcount"].tolist() == [False, False, True, False]


def test_flag_spo2_artifacts():
    df = pd.DataFrame({"spo2_percentage": [98.0, 50.0, 68.5, 95.0]})
    out, count = flag_spo2_artifacts(df, min_valid=70.0)
    assert count == 2
    assert out["is_probable_artifact"].tolist() == [False, True, True, False]


def test_flag_step_anomalies():
    df = pd.DataFrame({"step_count": [15, 150, 250, 1118]})
    out, count = flag_step_anomalies(df, threshold=200)
    assert count == 2
    assert out["is_high_intensity"].tolist() == [False, False, True, True]

    # Negative steps must raise error
    with pytest.raises(ValueError):
        flag_step_anomalies(pd.DataFrame({"step_count": [-5]}))


# -----------------------------------------------------------------------------
# 4. Deduplication Tests
# -----------------------------------------------------------------------------

def test_deduplicate_stress_updates():
    df = pd.DataFrame({
        "participant_id": [2, 2, 30, 30, 1],
        "measurement_date": [
            datetime.date(2025, 5, 6),
            datetime.date(2025, 5, 6),
            datetime.date(2025, 4, 21),
            datetime.date(2025, 4, 21),
            datetime.date(2025, 3, 1)
        ],
        "updated_at": [
            "2025-05-07T00:10:09.433Z",
            "2025-05-07T02:11:30.894Z",  # newer
            "2025-04-21T13:53:59.458Z",
            "2025-04-22T02:09:28.967Z",  # newer
            "2025-03-01T12:00:00.000Z"
        ],
        "stress_score": [np.nan, np.nan, 76.0, 72.0, 60.0]
    })
    clean, dropped = deduplicate_stress_updates(df)
    assert len(clean) == 3
    assert len(dropped) == 2
    # Check that participant 30 has score 72.0 (from later updated_at)
    p30_score = clean[clean["participant_id"] == 30]["stress_score"].iloc[0]
    assert p30_score == 72.0
    assert "drop_reason" in dropped.columns


# -----------------------------------------------------------------------------
# 5. Temporal Alignment (Participant-Day) Tests
# -----------------------------------------------------------------------------

def test_daily_alignment():
    # Synthetic participant steps
    df_steps = pd.DataFrame({
        "participant_id": [1, 1, 1],
        "timestamp": pd.to_datetime(["2025-03-01 10:00:00Z", "2025-03-01 10:01:00Z", "2025-03-02 08:00:00Z"]),
        "step_count": [50, 100, 30]
    })
    # Synthetic participant questions
    df_questions = pd.DataFrame({
        "participant_id": [1, 1],
        "scheduled_at": pd.to_datetime(["2025-03-01 09:00:00Z", "2025-03-03 09:00:00Z"]),
        "stress_level": [40, 60],
        "anxiety_level": [20, 30]
    })

    sensor_daily = aggregate_daily_sensors(df_steps=df_steps)
    survey_daily = aggregate_daily_questionnaires(df_questions)
    aligned = build_participant_day_dataset(sensor_daily, survey_daily)

    # Participant 1 should have 3 days: 2025-03-01, 2025-03-02, 2025-03-03
    assert len(aligned) == 3
    
    # Day 1: Both sensor and survey exist
    day1 = aligned[aligned["date"] == datetime.date(2025, 3, 1)].iloc[0]
    assert day1["total_steps"] == 150
    assert day1["reported_stress_mean"] == 40.0
    assert day1["has_sensor_data"] == True
    assert day1["has_questionnaire_data"] == True
    assert day1["has_both_modalities"] == True

    # Day 2: Sensor only
    day2 = aligned[aligned["date"] == datetime.date(2025, 3, 2)].iloc[0]
    assert day2["total_steps"] == 30
    assert pd.isna(day2["reported_stress_mean"])
    assert day2["has_sensor_data"] == True
    assert day2["has_questionnaire_data"] == False
    assert day2["has_both_modalities"] == False

    # Day 3: Questionnaire only
    day3 = aligned[aligned["date"] == datetime.date(2025, 3, 3)].iloc[0]
    assert pd.isna(day3["total_steps"])
    assert day3["reported_stress_mean"] == 60.0
    assert day3["has_sensor_data"] == False
    assert day3["has_questionnaire_data"] == True
    assert day3["has_both_modalities"] == False
