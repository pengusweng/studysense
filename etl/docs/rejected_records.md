# ETL Load & Audit Report

**Pipeline Status**: `SUCCESS`  
**Total Rejected Records**: `2`  

## Summary of Loaded Entities

| Table Name | Raw Rows Read | Clean Rows Staged | Rows Inserted / Upserted | Rows Rejected | Audit Rule / Behavior |
|---|---|---|---|---|---|
| `clean.courses` | 3 | 3 | 3 | 0 | Academic calendar dimensions; undergraduate flag cast to boolean; times parsed. |
| `clean.participants` | 35 | 35 | 35 | 0 | Cohort dimensions; validated against enrolled courses; wearable presence flagged. |
| `clean.daily_questions` | 3,133 | 3,133 | 3,133 | 0 | Sentinels (sent=0) handled as initial sends (`is_resent=False`); epoch timestamps converted to UTC. |
| `clean.stress` | 1,777 | 1,775 | 1,775 | 2 | Superseded duplicate calculations dropped and logged to `clean.rejected_records`; calculation failures preserved as `stress_score = NULL`. |
| `clean.sleep` | 1,829 | 1,829 | 0 | 0 | Nightly sleep score & deep sleep minutes parsed and mapped to UTC. |
| `clean.oxygen` | 978,367 | 978,367 | 0 | 0 | Optical pulse oximeter disconnections (< 70%) flagged via `is_probable_artifact`; zero rows dropped. |
| `clean.steps` | 658,894 | 658,894 | 0 | 0 | Cadence bursts (> 200 steps/min) flagged via `is_high_intensity`; zero rows dropped. |
| `clean.activity_level` | 1,766,244 | 1,766,244 | 0 | 0 | Minute-level activity classification validated against standard categories. |
| `clean.hrv` | 151,243 | 151,243 | 0 | 0 | Zero RMSSD flagged via `is_valid_rmssd`; epoch boundary sampling overlap flagged via `is_coverage_overcount`. |

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
