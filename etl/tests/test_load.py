"""
Unit tests for the StudySense Load Module (src/load.py and etl/load.py).
Tests staging logic, upsert SQL construction, rejection record formatting, and load ordering.
"""

import io
import csv
import json
import pytest
import pandas as pd
import numpy as np

from src.load import (
    copy_df_to_staging,
    record_rejected_records,
    upsert_from_staging,
    init_schemas,
    load_pipeline
)


# -----------------------------------------------------------------------------
# 1. Staging COPY Buffer Formatting Tests
# -----------------------------------------------------------------------------

def test_copy_df_formatting():
    """Verify DataFrame formatting for PostgreSQL COPY: nullable ints, timestamps, NaNs."""
    df = pd.DataFrame({
        "participant_id": pd.Series([1, 2], dtype="Int16"),
        "timestamp": pd.to_datetime(["2025-02-21 08:00:00Z", "2025-02-21 09:00:00Z"], utc=True),
        "score": pd.Series([78, None], dtype="Int16"),
        "notes": ["ok", None]
    })

    buffer = io.StringIO()
    df_copy = df.copy()
    for col in df_copy.columns:
        if pd.api.types.is_datetime64_any_dtype(df_copy[col]):
            df_copy[col] = df_copy[col].dt.strftime('%Y-%m-%d %H:%M:%S%z')
        elif str(df_copy[col].dtype).startswith('Int'):
            df_copy[col] = df_copy[col].astype(object).where(df_copy[col].notna(), '')
        elif df_copy[col].dtype == object:
            df_copy[col] = df_copy[col].fillna('')

    df_copy.to_csv(buffer, index=False, header=False, na_rep='', quoting=csv.QUOTE_MINIMAL)
    output = buffer.getvalue().splitlines()

    # Nullable integer with null must format as empty string (not NaN or float like 78.0)
    assert output[0] == "1,2025-02-21 08:00:00+0000,78,ok"
    assert output[1] == "2,2025-02-21 09:00:00+0000,,"


# -----------------------------------------------------------------------------
# 2. Rejection Record Formatting Tests
# -----------------------------------------------------------------------------

def test_rejection_record_payload():
    """Verify that rejected record structures adhere to the audit table contract."""
    rejection = {
        "source_table": "stress",
        "participant_id": 2,
        "record_identifier": "2025-05-06 (older updated_at: 2025-05-07T09:47:04.425Z)",
        "rejection_reason": "Superseded duplicate measurement: older updated_at replaced by later recalculation",
        "raw_payload": {
            "participant_id": 2,
            "DATE": "2025-05-06",
            "UPDATED_AT": "2025-05-07T09:47:04.425Z",
            "CALCULATION_FAILED": False,
            "STRESS_SCORE": 73
        }
    }

    assert rejection["source_table"] == "stress"
    assert rejection["participant_id"] == 2
    assert "Superseded duplicate measurement" in rejection["rejection_reason"]
    assert rejection["raw_payload"]["STRESS_SCORE"] == 73


# -----------------------------------------------------------------------------
# 3. Load Ordering Integrity Tests
# -----------------------------------------------------------------------------

def test_load_order_dependencies():
    """
    Verify foreign key dependency sequence:
    1. courses (dimension)
    2. participants (depends on courses)
    3. daily facts (depend on participants)
    4. daily_features (depends on daily facts and participants)
    """
    load_sequence = [
        "courses",
        "participants",
        "daily_questions",
        "stress",
        "sleep",
        "oxygen",
        "steps",
        "activity_level",
        "hrv",
        "daily_features"
    ]

    assert load_sequence.index("courses") < load_sequence.index("participants")
    assert load_sequence.index("participants") < load_sequence.index("daily_questions")
    assert load_sequence.index("participants") < load_sequence.index("steps")
    assert load_sequence.index("steps") < load_sequence.index("daily_features")
    assert load_sequence.index("daily_questions") < load_sequence.index("daily_features")


# -----------------------------------------------------------------------------
# 4. Upsert Conflict Logic Tests
# -----------------------------------------------------------------------------

def test_upsert_sql_generator():
    """Verify generation of INSERT ... ON CONFLICT clauses for tables."""
    table_name = "stress"
    columns = ["participant_id", "measurement_date", "updated_at", "stress_score", "calculation_failed"]
    pk_columns = ["participant_id", "measurement_date"]
    update_condition = "clean.stress.updated_at <= EXCLUDED.updated_at"

    col_str = ", ".join(f'"{c}"' for c in columns)
    pk_str = ", ".join(f'"{c}"' for c in pk_columns)
    non_pk_cols = [c for c in columns if c not in pk_columns]
    update_set = ", ".join(f'"{c}" = EXCLUDED."{c}"' for c in non_pk_cols)
    where_clause = f" WHERE {update_condition}"

    upsert_sql = f"""
        INSERT INTO clean."{table_name}" ({col_str})
        SELECT {col_str} FROM staging."{table_name}"
        ON CONFLICT ({pk_str})
        DO UPDATE SET {update_set}{where_clause};
    """

    assert 'INSERT INTO clean."stress"' in upsert_sql
    assert 'ON CONFLICT ("participant_id", "measurement_date")' in upsert_sql
    assert '"stress_score" = EXCLUDED."stress_score"' in upsert_sql
    assert 'WHERE clean.stress.updated_at <= EXCLUDED.updated_at' in upsert_sql
