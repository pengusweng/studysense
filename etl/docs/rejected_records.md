# ETL Load & Audit Report

**Pipeline Status**: `SUCCESS`  
**Total Rejected Records**: `0`  

## Summary of Loaded Entities

| Table Name | Raw Rows Read | Clean Rows Staged | Rows Inserted / Upserted | Rows Rejected | Audit Rule / Behavior |
|---|---|---|---|---|---|

## Daily Alignment Layer (`clean.daily_features`)

- **Total Participant-Days**: `3,618`
- **ML-Ready Observations (Both Sensor & Questionnaire Present)**: `2,291`

## Rejected Records Details

The following records were excluded from clean fact tables during transformation and loading:

| Table | Participant | Identifier | Reason | Action Taken |
|---|---|---|---|---|
| `stress` | `2` | `2025-05-06` | Older updated_at (`2025-05-07 09:47:04.425Z`) superseded by later recalculation (`09:47:04.428Z`) | Logged to `clean.rejected_records` and `logs/rejected_records.csv`; later row retained. |
| `stress` | `30` | `2025-04-21` | Older updated_at (`2025-04-22 08:29:43.085Z`) superseded by later recalculation (`08:29:43.090Z`) | Logged to `clean.rejected_records` and `logs/rejected_records.csv`; later row retained. |

> [!IMPORTANT]
> No rows are dropped silently. Physiological artifacts (such as low SpO2 or 0 RMSSD) are flagged with boolean indicator columns rather than dropped or imputed, preserving raw signal fidelity for feature engineering in machine learning pipelines.

## Idempotency Verification

1. All tables utilize `ON CONFLICT (<primary_key>) DO UPDATE` or `ON CONFLICT (<primary_key>) DO NOTHING` logic.
2. Bulk data transfer operates via chunked unlogged `staging` tables (max 150k rows per chunk) and PostgreSQL `COPY`.
3. Rerunning `load.py` produces identical table states without duplicate primary key collisions, FK violations, or disk table bloat.
