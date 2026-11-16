"""
StudySense ETL: Transformation and Data Alignment Module.
Provides pure, modular, unit-testable transformation functions for the SSAQS dataset.
"""

from __future__ import annotations
import re
import datetime
import pandas as pd
import numpy as np


# =============================================================================
# 1. PURE STRING & COLUMN STANDARDIZATION FUNCTIONS
# =============================================================================

def to_snake_case(name: str) -> str:
    """
    Converts camelCase, PascalCase, or UPPER_CASE strings to clean snake_case.
    Examples:
        'timeStampScheduled' -> 'timestamp_scheduled'
        'CALCULATION_FAILED' -> 'calculation_failed'
        'startDate' -> 'start_date'
        'idcourse' -> 'idcourse'
    """
    # Replace sequences of underscores/hyphens with single underscore
    s = re.sub(r'[\s\-]+', '_', name)
    # Insert underscore before capital letters preceded by lowercase
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1_\2', s)
    # Handle consecutive uppercase letters (e.g., 'STRESS_SCORE' -> 'stress_score')
    return s.lower().strip('_')


def standardize_column_names(df: pd.DataFrame, rename_map: dict[str, str] | None = None) -> pd.DataFrame:
    """
    Returns a copy of the DataFrame with standardized snake_case column names,
    optionally applying an explicit renaming mapping first.
    """
    df_out = df.copy()
    if rename_map:
        df_out = df_out.rename(columns=rename_map)
    df_out.columns = [to_snake_case(col) for col in df_out.columns]
    return df_out


def trim_and_standardize_strings(series: pd.Series, uppercase: bool = False) -> pd.Series:
    """
    Trims leading/trailing whitespace from string series.
    Optionally converts categorical codes to uppercase.
    """
    s = series.astype(str).str.strip()
    # Convert 'nan' strings or empty strings back to real np.nan if needed
    s = s.replace({'nan': np.nan, '': np.nan})
    if uppercase:
        return s.str.upper()
    return s


# =============================================================================
# 2. PURE DATE, TIME & TIMESTAMP PARSING FUNCTIONS
# =============================================================================

def parse_unix_epoch_to_utc(series: pd.Series) -> pd.Series:
    """
    Parses integer or string UNIX epoch seconds into UTC tz-aware pandas datetimes.
    Non-numeric or NaN values become pd.NaT.
    """
    numeric_s = pd.to_numeric(series, errors='coerce')
    # Valid epoch timestamps in SSAQS are ~1.73e9 (year 2025). Sentinel 0 becomes NaT.
    valid_mask = numeric_s > 0
    dt_series = pd.Series(pd.NaT, index=series.index, dtype='datetime64[ns, UTC]')
    if valid_mask.any():
        dt_series[valid_mask] = pd.to_datetime(numeric_s[valid_mask], unit='s', utc=True)
    return dt_series


def parse_iso_timestamp_to_utc(series: pd.Series) -> pd.Series:
    """
    Parses ISO 8601 strings (both naive YYYY-MM-DDTHH:MM:SS and UTC YYYY-MM-DDTHH:MM:SSZ)
    into standard UTC tz-aware datetimes.
    """
    return pd.to_datetime(series, format='ISO8601', utc=True, errors='coerce')


def parse_us_date(series: pd.Series) -> pd.Series:
    """
    Parses date strings in M/D/YYYY format (e.g. '2/10/2025') into standard datetime.date objects.
    """
    dt_series = pd.to_datetime(series, format='%m/%d/%Y', errors='coerce')
    return dt_series.dt.date


def parse_time_string(series: pd.Series) -> pd.Series:
    """
    Parses time strings in H:MM or HH:MM format into standard datetime.time objects.
    """
    def _to_time(val):
        if pd.isna(val):
            return None
        val_str = str(val).strip()
        parts = val_str.split(':')
        if len(parts) >= 2:
            return datetime.time(int(parts[0]), int(parts[1]))
        return None

    return series.apply(_to_time)


# =============================================================================
# 3. PURE VALUE VALIDATION & SENTINEL/IMPOSSIBLE VALUE HANDLERS
# =============================================================================

def handle_sentinel_timestamps(series: pd.Series, sentinel_val: int = 0) -> tuple[pd.Series, pd.Series]:
    """
    Identifies sentinel values (e.g. originalTimeStampSent = 0 in survey prompts).
    Returns (cleaned_epoch_series_with_nan, is_sentinel_boolean_series).
    """
    numeric_s = pd.to_numeric(series, errors='coerce')
    is_sentinel = (numeric_s == sentinel_val) | numeric_s.isna()
    cleaned = numeric_s.copy()
    cleaned[is_sentinel] = np.nan
    return cleaned, (~is_sentinel)


def clean_stress_failures(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    When calculation_failed is True, sets stress_score to NaN (NULL).
    Preserves calculation_failed as boolean.
    Returns (cleaned_df, count_nullified).
    """
    df_out = df.copy()
    # Normalize calculation_failed to boolean
    is_failed = df_out['calculation_failed'].astype(str).str.strip().str.lower().isin(['true', '1', 't'])
    df_out['calculation_failed'] = is_failed
    
    # Check count of scores to be set to NULL
    scores = pd.to_numeric(df_out['stress_score'], errors='coerce')
    count_nullified = int((is_failed & scores.notna()).sum())
    
    # Set to NaN when failed (do NOT impute with 0), use nullable Int16 for clean integer formatting
    scores[is_failed] = np.nan
    df_out['stress_score'] = scores.astype('Int16')
    return df_out, count_nullified


def flag_zero_rmssd(df: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """
    Flags physiologically impossible 0.0 ms RMSSD values as is_valid_rmssd = False.
    Retains numeric rmssd without silent deletion or imputation.
    """
    df_out = df.copy()
    rmssd_numeric = pd.to_numeric(df_out['rmssd'], errors='coerce')
    df_out['rmssd'] = rmssd_numeric
    is_zero = (rmssd_numeric == 0.0)
    df_out['is_valid_rmssd'] = ~is_zero
    return df_out, int(is_zero.sum())


def flag_coverage_overcount(df: pd.DataFrame, max_valid: float = 1.0) -> tuple[pd.DataFrame, int]:
    """
    Flags HRV 5-minute sampling window edge overcounts (coverage > 1.0)
    with is_coverage_overcount = True. Retains original coverage value.
    """
    df_out = df.copy()
    coverage_numeric = pd.to_numeric(df_out['coverage'], errors='coerce')
    df_out['coverage'] = coverage_numeric
    is_over = coverage_numeric > max_valid
    df_out['is_coverage_overcount'] = is_over
    return df_out, int(is_over.sum())


def flag_spo2_artifacts(df: pd.DataFrame, min_valid: float = 70.0) -> tuple[pd.DataFrame, int]:
    """
    Flags SpO2 readings below sensor reliable threshold (70.0%) as is_probable_artifact = True.
    Retains original numeric value without imputation.
    """
    df_out = df.copy()
    val_numeric = pd.to_numeric(df_out['spo2_percentage'], errors='coerce')
    df_out['spo2_percentage'] = val_numeric
    is_artifact = val_numeric < min_valid
    df_out['is_probable_artifact'] = is_artifact
    return df_out, int(is_artifact.sum())


def flag_step_anomalies(df: pd.DataFrame, threshold: int = 200) -> tuple[pd.DataFrame, int]:
    """
    Flags extreme step counts (> threshold steps/min) as is_high_intensity = True.
    Validates non-negativity.
    """
    df_out = df.copy()
    steps_numeric = pd.to_numeric(df_out['step_count'], errors='coerce')
    if (steps_numeric < 0).any():
        raise ValueError("Negative steps detected in input data.")
    df_out['step_count'] = steps_numeric
    is_high = steps_numeric > threshold
    df_out['is_high_intensity'] = is_high
    return df_out, int(is_high.sum())


# =============================================================================
# 4. PURE DEDUPLICATION FUNCTIONS
# =============================================================================

def deduplicate_stress_updates(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Deduplicates records sharing the same (participant_id, measurement_date) by retaining
    the row with the latest updated_at timestamp.
    Returns (deduplicated_df, dropped_rows_log).
    """
    df_work = df.copy()
    # Ensure updated_at is datetime for accurate chronological sorting
    if not pd.api.types.is_datetime64_any_dtype(df_work['updated_at']):
        df_work['updated_at'] = pd.to_datetime(df_work['updated_at'], utc=True)
    
    # Sort by updated_at descending
    df_sorted = df_work.sort_values(by=['participant_id', 'measurement_date', 'updated_at'], ascending=[True, True, False])
    
    dup_mask = df_sorted.duplicated(subset=['participant_id', 'measurement_date'], keep='first')
    dropped_rows = df_sorted[dup_mask].copy()
    dropped_rows['drop_reason'] = 'Superseded by later updated_at calculation'
    
    clean_df = df_sorted[~dup_mask].sort_values(by=['participant_id', 'measurement_date']).reset_index(drop=True)
    return clean_df, dropped_rows


# =============================================================================
# 5. TABLE-LEVEL TRANSFORMATION PIPELINES
# =============================================================================

def transform_course_details(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Transforms raw.course_details into clean.courses."""
    df = df_raw.copy()
    rename_map = {
        'idcourse': 'course_id',
        'undergraduate': 'is_undergraduate',
        'startDate': 'start_date',
        'endDate': 'end_date',
        'semester': 'semester',
        'Monday': 'meets_monday',
        'Tuesday': 'meets_tuesday',
        'Wednesday': 'meets_wednesday',
        'Thursday': 'meets_thursday',
        'Friday': 'meets_friday',
        'startTime': 'start_time',
        'endTime': 'end_time'
    }
    df = standardize_column_names(df, rename_map)
    df['course_id'] = trim_and_standardize_strings(df['course_id'], uppercase=True)
    df['is_undergraduate'] = df['is_undergraduate'].astype(int) == 1
    df['start_date'] = parse_us_date(df['start_date'])
    df['end_date'] = parse_us_date(df['end_date'])
    df['semester'] = df['semester'].astype(int)
    for day in ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']:
        col = f'meets_{day}'
        df[col] = df[col].astype(int) == 1
    df['start_time'] = parse_time_string(df['start_time'])
    df['end_time'] = parse_time_string(df['end_time'])
    return df


def transform_users_courses(df_raw: pd.DataFrame, participants_with_sensors: set[int] | None = None) -> pd.DataFrame:
    """Transforms raw.users_courses into clean.participants."""
    df = df_raw.copy()
    if 'participant_id' not in df.columns:
        df = df.rename(columns={'userid': 'participant_id'})
    rename_map = {
        'university': 'university_id',
        'course': 'course_id'
    }
    df = standardize_column_names(df, rename_map)
    df = df.loc[:, ~df.columns.duplicated()]
    df['participant_id'] = df['participant_id'].astype(int)
    df['university_id'] = df['university_id'].astype(int)
    df['course_id'] = trim_and_standardize_strings(df['course_id'], uppercase=True)
    
    if participants_with_sensors is not None:
        df['has_wearable_data'] = df['participant_id'].isin(participants_with_sensors)
    else:
        # Default: participants 3, 12, 14 lack wearable sensors
        df['has_wearable_data'] = ~df['participant_id'].isin([3, 12, 14])
        
    return df[['participant_id', 'university_id', 'course_id', 'has_wearable_data']]


def transform_daily_questions(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Transforms raw.daily_questions into clean.daily_questions."""
    df = df_raw.copy()
    rename_map = {
        'timeStampScheduled': 'scheduled_at',
        'timeStampSent': 'sent_at',
        'timeStampStart': 'start_at',
        'timeStampStop': 'stop_at',
        'originalTimeStampSent': 'original_sent_at',
        'timeZoneOffset': 'timezone_offset_seconds',
        'deltaUTC': 'delta_utc',
        'stress': 'stress_level',
        'anxiety': 'anxiety_level'
    }
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    
    # Handle original_sent_at sentinel (0 means not resent)
    cleaned_orig, is_resent = handle_sentinel_timestamps(df['original_sent_at'], sentinel_val=0)
    df['original_sent_at'] = parse_unix_epoch_to_utc(cleaned_orig)
    df['is_resent'] = is_resent
    
    for col in ['scheduled_at', 'sent_at', 'start_at', 'stop_at']:
        df[col] = parse_unix_epoch_to_utc(df[col])
        
    df['timezone_offset_seconds'] = df['timezone_offset_seconds'].astype(int)
    df['delta_utc'] = df['delta_utc'].astype(int)
    df['stress_level'] = df['stress_level'].astype(int)
    df['anxiety_level'] = df['anxiety_level'].astype(int)
    
    # Clock skew audit: count where start_at < sent_at
    clock_skew_count = int((df['start_at'] < df['sent_at']).sum())
    stats = {'clock_skew_count': clock_skew_count, 'resent_count': int(is_resent.sum())}
    return df, stats


def transform_activity_level(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Transforms raw.activity_level into clean.activity_level."""
    df = df_raw.copy()
    rename_map = {'level': 'activity_level'}
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    df['timestamp'] = parse_iso_timestamp_to_utc(df['timestamp'])
    df['activity_level'] = trim_and_standardize_strings(df['activity_level'], uppercase=True)
    return df


def transform_steps(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Transforms raw.steps into clean.steps."""
    df = df_raw.copy()
    rename_map = {'steps': 'step_count'}
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    df['timestamp'] = parse_iso_timestamp_to_utc(df['timestamp'])
    df, high_count = flag_step_anomalies(df, threshold=200)
    return df, high_count


def transform_hrv(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """Transforms raw.hrv into clean.hrv."""
    df = df_raw.copy()
    df = standardize_column_names(df)
    df['participant_id'] = df['participant_id'].astype(int)
    df['timestamp'] = parse_iso_timestamp_to_utc(df['timestamp'])
    
    df, zero_rmssd_count = flag_zero_rmssd(df)
    df, coverage_overcount = flag_coverage_overcount(df)
    df['low_frequency'] = pd.to_numeric(df['low_frequency'], errors='coerce')
    df['high_frequency'] = pd.to_numeric(df['high_frequency'], errors='coerce')
    
    stats = {'zero_rmssd_count': zero_rmssd_count, 'coverage_overcount': coverage_overcount}
    return df, stats


def transform_oxygen(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, int]:
    """Transforms raw.oxygen into clean.oxygen."""
    df = df_raw.copy()
    rename_map = {'value': 'spo2_percentage'}
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    df['timestamp'] = parse_iso_timestamp_to_utc(df['timestamp'])
    df, artifact_count = flag_spo2_artifacts(df, min_valid=70.0)
    return df, artifact_count


def transform_sleep(df_raw: pd.DataFrame) -> pd.DataFrame:
    """Transforms raw.sleep into clean.sleep."""
    df = df_raw.copy()
    rename_map = {'deep_sleep_in_minutes': 'deep_sleep_minutes'}
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    df['timestamp'] = parse_iso_timestamp_to_utc(df['timestamp'])
    df['overall_score'] = pd.to_numeric(df['overall_score'], errors='coerce').astype(int)
    df['deep_sleep_minutes'] = pd.to_numeric(df['deep_sleep_minutes'], errors='coerce').astype(int)
    return df


def transform_stress(df_raw: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, int]:
    """
    Transforms raw.stress into clean.stress:
    - Normalizes column names
    - Enforces calculation_failed logic (stress_score -> NaN when failed)
    - Deduplicates updates by (participant_id, measurement_date) keeping latest updated_at
    Returns (clean_df, dropped_rows_log, nullified_count).
    """
    df = df_raw.copy()
    rename_map = {
        'DATE': 'measurement_date',
        'UPDATED_AT': 'updated_at',
        'STRESS_SCORE': 'stress_score',
        'CALCULATION_FAILED': 'calculation_failed'
    }
    df = standardize_column_names(df, rename_map)
    df['participant_id'] = df['participant_id'].astype(int)
    df['measurement_date'] = pd.to_datetime(df['measurement_date']).dt.date
    df['updated_at'] = parse_iso_timestamp_to_utc(df['updated_at'])
    
    # 1. Handle calculation failures
    df, nullified_count = clean_stress_failures(df)
    
    # 2. Deduplicate updates
    clean_df, dropped_log = deduplicate_stress_updates(df)
    return clean_df, dropped_log, nullified_count


# =============================================================================
# 6. TIME ALIGNMENT (UNIT OF ANALYSIS: PARTICIPANT-DAY)
# =============================================================================

def aggregate_daily_sensors(
    df_steps: pd.DataFrame | None = None,
    df_activity: pd.DataFrame | None = None,
    df_hrv: pd.DataFrame | None = None,
    df_oxygen: pd.DataFrame | None = None,
    df_sleep: pd.DataFrame | None = None,
    df_stress: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """
    Aggregates granular sensor tables into participant-day summary metrics.
    Unit of analysis: (participant_id, date).
    """
    daily_frames: list[pd.DataFrame] = []

    # 1. Steps
    if df_steps is not None and not df_steps.empty:
        df_s = df_steps.copy()
        df_s['date'] = df_s['timestamp'].dt.date
        steps_agg = df_s.groupby(['participant_id', 'date']).agg(
            total_steps=('step_count', 'sum'),
            mean_steps_per_min=('step_count', 'mean'),
            max_steps_per_min=('step_count', 'max'),
            active_minutes=('step_count', lambda x: (x > 0).sum())
        ).reset_index()
        daily_frames.append(steps_agg)

    # 2. Activity Level
    if df_activity is not None and not df_activity.empty:
        df_a = df_activity.copy()
        df_a['date'] = df_a['timestamp'].dt.date
        # Pivot minutes per activity level
        act_counts = df_a.groupby(['participant_id', 'date', 'activity_level']).size().unstack(fill_value=0)
        act_counts = act_counts.rename(columns={
            'SEDENTARY': 'sedentary_minutes',
            'LIGHTLY_ACTIVE': 'lightly_active_minutes',
            'MODERATELY_ACTIVE': 'moderately_active_minutes',
            'VERY_ACTIVE': 'very_active_minutes'
        }).reset_index()
        daily_frames.append(act_counts)

    # 3. HRV
    if df_hrv is not None and not df_hrv.empty:
        df_h = df_hrv.copy()
        df_h['date'] = df_h['timestamp'].dt.date
        # Calculate RMSSD excluding 0.0 artifacts
        valid_h = df_h[df_h.get('is_valid_rmssd', True)]
        hrv_agg = valid_h.groupby(['participant_id', 'date']).agg(
            mean_rmssd=('rmssd', 'mean'),
            min_rmssd=('rmssd', 'min'),
            max_rmssd=('rmssd', 'max'),
            mean_coverage=('coverage', 'mean'),
            mean_low_frequency=('low_frequency', 'mean'),
            mean_high_frequency=('high_frequency', 'mean'),
            hrv_reading_count=('rmssd', 'count')
        ).reset_index()
        daily_frames.append(hrv_agg)

    # 4. Oxygen (SpO2)
    if df_oxygen is not None and not df_oxygen.empty:
        df_o = df_oxygen.copy()
        df_o['date'] = df_o['timestamp'].dt.date
        oxy_agg = df_o.groupby(['participant_id', 'date']).agg(
            mean_spo2=('spo2_percentage', 'mean'),
            min_spo2=('spo2_percentage', 'min'),
            max_spo2=('spo2_percentage', 'max'),
            spo2_reading_count=('spo2_percentage', 'count'),
            artifact_spo2_count=('is_probable_artifact', lambda x: x.sum())
        ).reset_index()
        daily_frames.append(oxy_agg)

    # 5. Sleep
    if df_sleep is not None and not df_sleep.empty:
        df_sl = df_sleep.copy()
        df_sl['date'] = df_sl['timestamp'].dt.date
        sleep_agg = df_sl.groupby(['participant_id', 'date']).agg(
            sleep_overall_score=('overall_score', 'mean'),
            deep_sleep_minutes=('deep_sleep_minutes', 'sum')
        ).reset_index()
        daily_frames.append(sleep_agg)

    # 6. Stress (Fitbit calculated)
    if df_stress is not None and not df_stress.empty:
        df_st = df_stress.copy()
        df_st['date'] = df_st['measurement_date']
        stress_agg = df_st[['participant_id', 'date', 'stress_score', 'calculation_failed']].rename(
            columns={'stress_score': 'fitbit_stress_score', 'calculation_failed': 'fitbit_stress_calc_failed'}
        )
        daily_frames.append(stress_agg)

    if not daily_frames:
        return pd.DataFrame(columns=['participant_id', 'date'])

    # Merge all sensor daily metrics with outer join
    merged_sensor = daily_frames[0]
    for frame in daily_frames[1:]:
        merged_sensor = pd.merge(merged_sensor, frame, on=['participant_id', 'date'], how='outer')

    return merged_sensor


def aggregate_daily_questionnaires(df_questions: pd.DataFrame) -> pd.DataFrame:
    """
    Aggregates daily EMA questionnaire self-reports into participant-day target metrics.
    """
    if df_questions.empty:
        return pd.DataFrame(columns=['participant_id', 'date', 'reported_stress_mean', 'reported_anxiety_mean', 'survey_response_count'])

    df_q = df_questions.copy()
    # Use scheduled_at date in participant local timezone or UTC
    df_q['date'] = df_q['scheduled_at'].dt.date
    
    q_agg = df_q.groupby(['participant_id', 'date']).agg(
        reported_stress_mean=('stress_level', 'mean'),
        reported_stress_min=('stress_level', 'min'),
        reported_stress_max=('stress_level', 'max'),
        reported_anxiety_mean=('anxiety_level', 'mean'),
        reported_anxiety_min=('anxiety_level', 'min'),
        reported_anxiety_max=('anxiety_level', 'max'),
        survey_response_count=('stress_level', 'count')
    ).reset_index()
    return q_agg


def build_participant_day_dataset(
    df_sensors: pd.DataFrame,
    df_questionnaires: pd.DataFrame,
    all_participants: list[int] | None = None
) -> pd.DataFrame:
    """
    Combines daily aggregated sensor features and daily questionnaire targets.
    Produces an aligned participant-day dataset with explicit flags:
      - has_sensor_data (bool)
      - has_questionnaire_data (bool)
      - has_both_modalities (bool)
    """
    # Outer merge to retain all days with either sensor or survey data
    aligned = pd.merge(df_sensors, df_questionnaires, on=['participant_id', 'date'], how='outer')
    
    # Sensor presence flag: True if any sensor reading occurred
    sensor_cols = [c for c in df_sensors.columns if c not in ['participant_id', 'date']]
    has_sensor = aligned[sensor_cols].notna().any(axis=1) if sensor_cols else pd.Series(False, index=aligned.index)
    aligned['has_sensor_data'] = has_sensor
    
    # Questionnaire presence flag: True if survey was completed on that day
    aligned['has_questionnaire_data'] = aligned['survey_response_count'].notna() & (aligned['survey_response_count'] > 0)
    
    # Supervised learning ready flag: Both sensor data and ground-truth survey exist
    aligned['has_both_modalities'] = aligned['has_sensor_data'] & aligned['has_questionnaire_data']
    
    # Sort deterministically
    aligned = aligned.sort_values(by=['participant_id', 'date']).reset_index(drop=True)
    return aligned
