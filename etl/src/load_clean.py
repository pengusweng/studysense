"""
StudySense Clean Layer Loader.
Executes transformations from raw tables into clean tables and builds the participant-day aligned layer.
Completely idempotent.
"""

import os
import io
import sys
import csv
import logging
from pathlib import Path

# Add project root to sys.path
ETL_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ETL_DIR))

from dotenv import load_dotenv
import pandas as pd
import psycopg

from src.transform import (
    transform_course_details,
    transform_users_courses,
    transform_daily_questions,
    transform_activity_level,
    transform_steps,
    transform_hrv,
    transform_oxygen,
    transform_sleep,
    transform_stress,
    aggregate_daily_sensors,
    aggregate_daily_questionnaires,
    build_participant_day_dataset
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

ETL_DIR = Path(__file__).resolve().parent.parent
SQL_DIR = ETL_DIR / "sql"
ENV_FILE = ETL_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)

def get_connection():
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("Neither DIRECT_URL nor DATABASE_URL found in .env file.")
    if "?" in db_url:
        base, query = db_url.split("?", 1)
        params = [p for p in query.split("&") if not p.startswith("pgbouncer=")]
        db_url = base + ("?" + "&".join(params) if params else "")
    return psycopg.connect(db_url)

def init_clean_schemas(conn):
    logger.info("Applying clean DDL schemas...")
    for sql_file in ["001_clean_schema.sql", "002_daily_alignment.sql"]:
        path = SQL_DIR / sql_file
        with open(path, "r", encoding="utf-8") as f:
            sql = f.read()
        with conn.cursor() as cur:
            cur.execute(sql)
    conn.commit()

    logger.info("Truncating clean tables for idempotent execution...")
    tables = [
        "daily_features", "stress", "sleep", "oxygen", "hrv", "steps", 
        "activity_level", "daily_questions", "participants", "courses"
    ]
    with conn.cursor() as cur:
        for t in tables:
            cur.execute(f'TRUNCATE TABLE clean."{t}" CASCADE;')
    conn.commit()

def copy_df_to_postgres(conn, df: pd.DataFrame, target_table: str, columns: list[str]):
    col_str = ", ".join(f'"{c}"' for c in columns)
    copy_sql = f'COPY clean."{target_table}" ({col_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE, NULL \'\')'

    buffer = io.StringIO()
    df_copy = df[columns].copy()
    for col in df_copy.columns:
        if pd.api.types.is_datetime64_any_dtype(df_copy[col]):
            df_copy[col] = df_copy[col].dt.strftime('%Y-%m-%d %H:%M:%S%z')
        elif str(df_copy[col].dtype).startswith('Int'):
            df_copy[col] = df_copy[col].astype(object).where(df_copy[col].notna(), '')
        elif df_copy[col].dtype == object:
            df_copy[col] = df_copy[col].fillna('')

    df_copy.to_csv(buffer, index=False, header=False, na_rep='', quoting=csv.QUOTE_MINIMAL)
    buffer.seek(0)

    with conn.cursor() as cur:
        with cur.copy(copy_sql) as copy:
            copy.write(buffer.read())
    conn.commit()

def load_clean_layer():
    with get_connection() as conn:
        init_clean_schemas(conn)

        # 1. Courses
        logger.info("Transforming and loading clean.courses...")
        df_raw_courses = pd.read_sql('SELECT * FROM raw.course_details;', conn)
        df_clean_courses = transform_course_details(df_raw_courses)
        course_cols = ["course_id", "is_undergraduate", "start_date", "end_date", "semester", "meets_monday", "meets_tuesday", "meets_wednesday", "meets_thursday", "meets_friday", "start_time", "end_time"]
        copy_df_to_postgres(conn, df_clean_courses, "courses", course_cols)
        logger.info(f"Loaded clean.courses: {len(df_clean_courses)} rows")

        # 2. Participants
        logger.info("Transforming and loading clean.participants...")
        df_raw_users = pd.read_sql('SELECT * FROM raw.users_courses;', conn)
        df_clean_participants = transform_users_courses(df_raw_users)
        part_cols = ["participant_id", "university_id", "course_id", "has_wearable_data"]
        copy_df_to_postgres(conn, df_clean_participants, "participants", part_cols)
        logger.info(f"Loaded clean.participants: {len(df_clean_participants)} rows")

        # 3. Daily Questions
        logger.info("Transforming and loading clean.daily_questions...")
        df_raw_dq = pd.read_sql('SELECT * FROM raw.daily_questions;', conn)
        df_clean_dq, dq_stats = transform_daily_questions(df_raw_dq)
        dq_cols = ["participant_id", "scheduled_at", "sent_at", "start_at", "stop_at", "original_sent_at", "is_resent", "timezone_offset_seconds", "delta_utc", "stress_level", "anxiety_level"]
        copy_df_to_postgres(conn, df_clean_dq, "daily_questions", dq_cols)
        logger.info(f"Loaded clean.daily_questions: {len(df_clean_dq)} rows (resent: {dq_stats['resent_count']}, clock-skew: {dq_stats['clock_skew_count']})")

        # 4. Stress
        logger.info("Transforming and loading clean.stress...")
        df_raw_stress = pd.read_sql('SELECT * FROM raw.stress;', conn)
        df_clean_stress, dropped_stress, nullified_count = transform_stress(df_raw_stress)
        stress_cols = ["participant_id", "measurement_date", "updated_at", "stress_score", "calculation_failed"]
        copy_df_to_postgres(conn, df_clean_stress, "stress", stress_cols)
        logger.info(f"Loaded clean.stress: {len(df_clean_stress)} rows (superseded duplicates dropped: {len(dropped_stress)}, nullified failed scores: {nullified_count})")
        if not dropped_stress.empty:
            for _, r in dropped_stress.iterrows():
                logger.info(f"  [AUDIT DROP] Participant {r['participant_id']} on {r['measurement_date']} dropped (older updated_at: {r['updated_at']})")

        # 5. Sleep
        logger.info("Transforming and loading clean.sleep...")
        df_raw_sleep = pd.read_sql('SELECT * FROM raw.sleep;', conn)
        df_clean_sleep = transform_sleep(df_raw_sleep)
        sleep_cols = ["participant_id", "timestamp", "overall_score", "deep_sleep_minutes"]
        copy_df_to_postgres(conn, df_clean_sleep, "sleep", sleep_cols)
        logger.info(f"Loaded clean.sleep: {len(df_clean_sleep)} rows")

        # 6. Oxygen
        logger.info("Transforming and loading clean.oxygen...")
        df_raw_oxygen = pd.read_sql('SELECT * FROM raw.oxygen;', conn)
        df_clean_oxygen, oxy_artifact_count = transform_oxygen(df_raw_oxygen)
        oxygen_cols = ["participant_id", "timestamp", "spo2_percentage", "is_probable_artifact"]
        copy_df_to_postgres(conn, df_clean_oxygen, "oxygen", oxygen_cols)
        logger.info(f"Loaded clean.oxygen: {len(df_clean_oxygen)} rows (flagged artifacts: {oxy_artifact_count})")

        # 7. Steps
        logger.info("Transforming and loading clean.steps...")
        df_raw_steps = pd.read_sql('SELECT * FROM raw.steps;', conn)
        df_clean_steps, steps_high_count = transform_steps(df_raw_steps)
        steps_cols = ["participant_id", "timestamp", "step_count", "is_high_intensity"]
        copy_df_to_postgres(conn, df_clean_steps, "steps", steps_cols)
        logger.info(f"Loaded clean.steps: {len(df_clean_steps)} rows (high intensity flagged: {steps_high_count})")

        # 8. Activity Level
        logger.info("Transforming and loading clean.activity_level...")
        df_raw_act = pd.read_sql('SELECT * FROM raw.activity_level;', conn)
        df_clean_act = transform_activity_level(df_raw_act)
        act_cols = ["participant_id", "timestamp", "activity_level"]
        copy_df_to_postgres(conn, df_clean_act, "activity_level", act_cols)
        logger.info(f"Loaded clean.activity_level: {len(df_clean_act)} rows")

        # 9. HRV
        logger.info("Transforming and loading clean.hrv...")
        df_raw_hrv = pd.read_sql('SELECT * FROM raw.hrv;', conn)
        df_clean_hrv, hrv_stats = transform_hrv(df_raw_hrv)
        hrv_cols = ["participant_id", "timestamp", "rmssd", "coverage", "low_frequency", "high_frequency", "is_valid_rmssd", "is_coverage_overcount"]
        copy_df_to_postgres(conn, df_clean_hrv, "hrv", hrv_cols)
        logger.info(f"Loaded clean.hrv: {len(df_clean_hrv)} rows (zero RMSSD flagged: {hrv_stats['zero_rmssd_count']}, overcounts: {hrv_stats['coverage_overcount']})")

        # 10. Temporal Alignment (Participant-Day Dataset via SQL)
        logger.info("Building clean.daily_features (participant-day alignment)...")
        with open(SQL_DIR / "002_daily_alignment.sql", "r", encoding="utf-8") as f:
            align_sql = f.read()
        with conn.cursor() as cur:
            cur.execute(align_sql)
            cur.execute("SELECT COUNT(*), COUNT(*) FILTER (WHERE has_both_modalities = TRUE) FROM clean.daily_features;")
            total_days, ml_ready_days = cur.fetchone()
        conn.commit()
        logger.info(f"Loaded clean.daily_features: {total_days:,} participant-days (both modalities / ML-ready: {ml_ready_days:,})")

        logger.info("Clean layer transformation and time alignment completed successfully!")

if __name__ == "__main__":
    load_clean_layer()
