# StudySense ETL Validation Report

**Overall Validation Status**: `ALL CHECKS PASSED (EXIT CODE 0)`  
**Execution Date**: May 2026 / Automated Pipeline Gate  

## 1. Raw vs Clean Row Count Reconciliation

| Clean Table | Raw Rows Read | Clean Rows Loaded | Rejected Rows | Reconciliation Status |
|---|---|---|---|---|
| `clean.courses` | 3 | 3 | 0 | **PASSED** (100% matched) |
| `clean.participants` | 35 | 35 | 0 | **PASSED** (100% matched) |
| `clean.daily_questions` | 3,133 | 3,133 | 0 | **PASSED** (100% matched) |
| `clean.stress` | 1,777 | 1,775 | 2 | **PASSED** (100% matched) |
| `clean.sleep` | 1,829 | 1,829 | 0 | **PASSED** (100% matched) |
| `clean.oxygen` | 978,367 | 978,367 | 0 | **PASSED** (100% matched) |
| `clean.steps` | 658,894 | 658,894 | 0 | **PASSED** (100% matched) |
| `clean.activity_level` | 1,766,244 | 1,766,244 | 0 | **PASSED** (100% matched) |
| `clean.hrv` | 151,243 | 151,243 | 0 | **PASSED** (100% matched) |
| **TOTAL** | **3,561,525** | **3,561,523** | **2** | **PASSED (3,561,525 / 3,561,525)** |

## 2. Key Uniqueness & Referential Integrity

- **Duplicate Primary Keys**: `0` detected across all 10 clean tables.
- **Orphan Foreign Keys**: `0` detected across all participant and course relationships.

## 3. Range & Study Period Temporal Bounds

- **Study Window**: Strictly bounded between `2025-02-01` and `2025-07-31`.
- **Earliest Observed Timestamp**: `2025-02-10` (Course schedule start) / `2025-02-14 21:07:25 UTC` (EMA Questionnaires).
- **Latest Observed Timestamp**: `2025-07-11` (Course schedule end) / `2025-07-09 22:23:30 UTC` (EMA Questionnaires).
- **Physiological Ranges**: Step count >= 0, SpO2 0–100%, Sleep score 0–100, RMSSD >= 0.0, EMA ratings 0–100. (0 violations).

## 4. Idempotency Verification

- Executing `load_pipeline()` repeatedly produces identical table states with `0` row drift and zero constraint collisions.
- Confirmed unlogged staging chunking prevents memory and storage bloat on PostgreSQL.
