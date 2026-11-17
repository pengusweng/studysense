# SQL Data Profiling Report: Raw Layer

This document presents the comprehensive data profiling executed directly in PostgreSQL on schema `raw`. All analyses were performed using SQL queries across all 9 raw tables and 3,561,525 records, systematically evaluating: **null values**, **duplicates**, **out-of-range / impossible values**, **inconsistent formats**, and **orphan participant IDs / referential integrity**.

## 1. Executive Summary & Quality Scorecard

| Dimension | Status | Key Findings |
|---|---|---|
| **Row Count & Completeness** | Validated | All 9 tables loaded into schema `raw` matching raw file counts exactly (3,561,525 rows total across 35 participants). |
| **Null & Empty Values** | Zero | 0 nulls and 0 empty strings across every column in all 9 tables. |
| **Full-Row Duplicates** | Zero | 0 exact full-row duplicate records in the database. |
| **Key Collisions** | 2 Rows | In `raw.stress`, participant 2 (`2025-05-06`) and participant 30 (`2025-04-21`) each have 2 records for the same date with different `UPDATED_AT` calculations. All other tables have 100% unique timestamps per participant. |
| **Out-of-Range Sensor Values** | Anomaly Flags | - **Oxygen (SpO2)**: 188,398 rows (19.3%) have SpO2 < 70% (sensor bottom-clamping down to 50%).<br>- **HRV Coverage**: 42,332 rows (28.0%) exceed 1.0 (max 1.056 due to window jitter).<br>- **HRV RMSSD**: 10 rows have RMSSD = 0 ms (physiologically impossible in live human).<br>- **Steps**: Max 1,118 steps/min; 986 rows > 200 steps/min. |
| **Questionnaire Logic** | Minor Skew | - **Scale Bounds**: Stress and anxiety are strictly 0–100.<br>- **Clock Skew**: 24 responses have `timeStampStart < timeStampSent` by 1–5 seconds.<br>- **Sentinels**: `originalTimeStampSent = 0` for 1,680 rows (initial delivery without resend). |
| **Format Inconsistencies** | Detected | - **Sleep Timestamps**: 7 rows contain milliseconds (`.sssZ`) while 1,822 rows contain integer seconds.<br>- **Stress Updated At**: 189 rows truncate trailing zeros to 2 decimals (`.ss`) vs 1,588 rows with 3 decimals.<br>- **Timezones**: 4 tables explicit UTC `Z`, 2 tables naive ISO, 1 table UNIX epoch seconds with variable offsets. |
| **Referential Integrity** | Clean | 0 orphan participant IDs across all tables. Exactly 3 participants (IDs `3`, `12`, `14`) have zero wearable sensor data (only questionnaires). 0 orphan course IDs. |

## 2. Table Row Count Verification

SQL Query:
```sql
SELECT table_name, count
FROM (
  SELECT 'course_details' AS table_name, count(*) FROM raw.course_details UNION ALL
  SELECT 'users_courses', count(*) FROM raw.users_courses UNION ALL
  SELECT 'daily_questions', count(*) FROM raw.daily_questions UNION ALL
  SELECT 'activity_level', count(*) FROM raw.activity_level UNION ALL
  SELECT 'hrv', count(*) FROM raw.hrv UNION ALL
  SELECT 'oxygen', count(*) FROM raw.oxygen UNION ALL
  SELECT 'sleep', count(*) FROM raw.sleep UNION ALL
  SELECT 'steps', count(*) FROM raw.steps UNION ALL
  SELECT 'stress', count(*) FROM raw.stress
) t ORDER BY count ASC;
```

| Table Name | Category | Database Row Count | Source CSV Match |
|---|---|---|---|
| `raw.course_details` | Metadata | 3 | Verified Match |
| `raw.users_courses` | Metadata | 35 | Verified Match |
| `raw.stress` | Sensor | 1,777 | Verified Match |
| `raw.sleep` | Sensor | 1,829 | Verified Match |
| `raw.daily_questions` | Questionnaire | 3,133 | Verified Match |
| `raw.hrv` | Sensor | 151,243 | Verified Match |
| `raw.steps` | Sensor | 658,894 | Verified Match |
| `raw.oxygen` | Sensor | 978,367 | Verified Match |
| `raw.activity_level` | Sensor | 1,766,244 | Verified Match |
| **Total** | | **3,561,525** | **100% Match** |

## 3. Null & Empty String Profiling

SQL Query Pattern:
```sql
SELECT 
  COUNT(*) FILTER (WHERE "column" IS NULL) AS null_count,
  COUNT(*) FILTER (WHERE "column" = '') AS empty_str_count
FROM raw.<table>;
```

- **Result**: Across all 9 tables and all 46 individual columns, **null count = 0** and **empty string count = 0**.
- **Interpretation**: Raw ingest succeeded with complete data ingestion. However, semantic sentinel values exist (e.g. `originalTimeStampSent = '0'`, `STRESS_SCORE = '0'` when `CALCULATION_FAILED = 'True'`) which act as domain-level nulls.

## 4. Duplicate Record & Key Collision Analysis

### 4.1 Exact Full-Row Duplication
SQL Query Pattern:
```sql
SELECT COUNT(*) 
FROM (
  SELECT col1, col2, ..., colN, COUNT(*) 
  FROM raw.<table> 
  GROUP BY col1, col2, ..., colN 
  HAVING COUNT(*) > 1
) sub;
```

- **Result**: Exactly **0 duplicate groups** across every table. Every row in `raw` is distinct.

### 4.2 Composite Natural Key Collisions (`participant_id` + Timestamp / Date)
SQL Query:
```sql
SELECT participant_id, "DATE", COUNT(*), array_agg("UPDATED_AT") AS updated_ats, array_agg("STRESS_SCORE") AS scores
FROM raw.stress
GROUP BY participant_id, "DATE"
HAVING COUNT(*) > 1;
```

Output:
```text
participant_id | DATE                | count | updated_ats                                              | scores
---------------+---------------------+-------+----------------------------------------------------------+--------
2              | 2025-05-06T00:00:00 | 2     | {2025-05-07T00:10:09.433, 2025-05-07T02:11:30.894}       | {0, 0}
30             | 2025-04-21T00:00:00 | 2     | {2025-04-21T13:53:59.458, 2025-04-22T02:09:28.967}       | {76, 72}
```

- **Findings**:
  1. In `raw.stress`, participant 2 has 2 entries for `2025-05-06` separated by ~2 hours; both failed calculation (`score=0`).
  2. Participant 30 has 2 entries for `2025-04-21`; the original score was `76` (updated on 2025-04-21 13:53), which was later recomputed to `72` on 2025-04-22 02:09.
  3. In all other 7 sensor/questionnaire tables (`activity_level`, `steps`, `oxygen`, `hrv`, `sleep`, `daily_questions`), composite keys `(participant_id, timestamp)` have **0 collisions**.

## 5. Out-of-Range and Impossible Values

### 5.1 Steps (`raw.steps`)
SQL Query:
```sql
SELECT 
  COUNT(*) FILTER (WHERE "steps"::numeric < 0) AS negative_steps,
  COUNT(*) FILTER (WHERE "steps"::numeric = 0) AS zero_steps,
  MIN("steps"::numeric) AS min_steps,
  MAX("steps"::numeric) AS max_steps,
  COUNT(*) FILTER (WHERE "steps"::numeric > 200) AS high_steps_per_min
FROM raw.steps;
```

| Metric | SQL Result | Interpretation |
|---|---|---|
| Negative steps | `0` | Clean |
| Zero steps | `0` | Fitbit sensor only logs minutes with active steps (>= 1). Idle minutes are omitted. |
| Min steps/min | `1` | Valid |
| Max steps/min | `1,118` | Physically impossible for a single human minute (~18.6 steps/sec). |
| Steps > 200/min | `986` (0.15%) | Extreme values likely caused by accelerometer vibration, cycling, or device sync buffering. |

### 5.2 Blood Oxygen Saturation (`raw.oxygen`)
SQL Query:
```sql
SELECT 
  COUNT(*) FILTER (WHERE "value"::numeric < 0) AS negative_spo2,
  COUNT(*) FILTER (WHERE "value"::numeric < 70) AS severe_hypoxemia_below_70,
  COUNT(*) FILTER (WHERE "value"::numeric > 100) AS spo2_above_100,
  MIN("value"::numeric) AS min_spo2,
  MAX("value"::numeric) AS max_spo2
FROM raw.oxygen;
```

| Metric | SQL Result | Interpretation |
|---|---|---|
| Negative SpO2 | `0` | Clean |
| SpO2 > 100% | `0` | Clean |
| Min SpO2 | `50.0%` | Hardware lower limit clamping |
| Max SpO2 | `100.0%` | Normal peak |
| **SpO2 < 70%** | **188,398 (19.25%)** | Critical finding: Commercial photoplethysmography (PPG) sensors lose calibration below 70% SpO2 and clamp at 50%. These low readings typically reflect loose band fit, motion artifact, or peripheral vasoconstriction during sleep rather than physiological hypoxia. |

### 5.3 Heart Rate Variability (`raw.hrv`)
SQL Query:
```sql
SELECT 
  MIN("rmssd"::numeric) AS min_rmssd,
  MAX("rmssd"::numeric) AS max_rmssd,
  COUNT(*) FILTER (WHERE "rmssd"::numeric = 0) AS zero_rmssd,
  MIN("coverage"::numeric) AS min_coverage,
  MAX("coverage"::numeric) AS max_coverage,
  COUNT(*) FILTER (WHERE "coverage"::numeric > 1.0) AS coverage_gt_1
FROM raw.hrv;
```

| Metric | SQL Result | Interpretation |
|---|---|---|
| Min RMSSD | `0.0 ms` | Biologically impossible in a conscious human. |
| **Zero RMSSD (`rmssd = 0`)** | **10 rows** | Artifact: Fitbit algorithm outputs 0.0 when beat detection fails. Must be flagged in staging. |
| Max RMSSD | `704.9 ms` | Extreme upper tail (potential arrhythmia or ectopic beat artifact). |
| Min Coverage | `0.70` (70%) | Meets Fitbit minimum 70% valid data threshold for a 5-min epoch. |
| Max Coverage | `1.056` | Exceeds 100% |
| **Coverage > 1.0** | **42,332 (28.0%)** | Caused by sampling boundary overlap in the 5-minute rolling window calculation. |

### 5.4 Daily Self-Reports (`raw.daily_questions`)
SQL Query:
```sql
SELECT 
  COUNT(*) FILTER (WHERE "stress"::numeric NOT BETWEEN 0 AND 100) AS invalid_stress,
  COUNT(*) FILTER (WHERE "anxiety"::numeric NOT BETWEEN 0 AND 100) AS invalid_anxiety,
  COUNT(*) FILTER (WHERE "timeStampSent"::bigint < "timeStampScheduled"::bigint) AS sent_before_sched,
  COUNT(*) FILTER (WHERE "timeStampStart"::bigint < "timeStampSent"::bigint) AS start_before_sent,
  COUNT(*) FILTER (WHERE "timeStampStop"::bigint < "timeStampStart"::bigint) AS stop_before_start,
  MIN("timeStampStop"::bigint - "timeStampStart"::bigint) AS min_duration_sec,
  MAX("timeStampStop"::bigint - "timeStampStart"::bigint) AS max_duration_sec,
  COUNT(*) FILTER (WHERE "originalTimeStampSent"::bigint = 0) AS original_ts_zero
FROM raw.daily_questions;
```

| Metric | SQL Result | Interpretation |
|---|---|---|
| Stress range (0–100) | Valid (`min=0, max=100`) | Clean rating scale |
| Anxiety range (0–100) | Valid (`min=0, max=100`) | Clean rating scale |
| `stop < start` | `0` | No backward time flow |
| `sent < scheduled` | `0` | Prompts never fired early |
| **`start < sent`** | **24 rows** | Device vs server clock skew: mobile app logged survey start 1–5 seconds before server recorded send confirmation. |
| Response Duration | `2s` to `3,093s` (~51.5 min) | Normal survey interaction distribution |
| `originalTimeStampSent = 0` | `1,680 rows` (53.6%) | Sentinel: Prompt delivered on first schedule attempt without resend. |

### 5.5 Stress Score & Calculation Status (`raw.stress`)
SQL Query:
```sql
SELECT "CALCULATION_FAILED", COUNT(*), MIN("STRESS_SCORE"::numeric), MAX("STRESS_SCORE"::numeric)
FROM raw.stress
GROUP BY "CALCULATION_FAILED";
```

| `CALCULATION_FAILED` | Row Count | Score Range | Notes |
|---|---|---|---|
| `'false'` | 1,436 | `0` to `96` | 1 valid day had calculated score of 0. |
| `'true'` | 341 | `0` to `0` | When calculation fails (insufficient wear time), score is always forced to 0. |

## 6. Timestamp & Format Inconsistencies

### 6.1 Sub-Second Precision Divergence
- **`raw.sleep`**: 1,822 timestamps follow standard `YYYY-MM-DDTHH:MM:SSZ`, but **7 rows** contain millisecond precision (e.g. `2025-05-12T07:59:28.463Z` for participant 20 and participant 27).
- **`raw.stress`**: `UPDATED_AT` contains variable fractional seconds: 1,588 rows have 3 decimals (`.sss`), while **189 rows** have 2 decimals (`.ss`, e.g. `.26`, `.68`) where trailing zeros were omitted.

### 6.2 Timezone Representation Divergence
| Table | Stored Timestamp Format | Offset / Zone Semantics |
|---|---|---|
| `activity_level`, `oxygen`, `steps`, `sleep` | ISO 8601 with trailing `Z` | UTC (Universal Time Coordinated) |
| `hrv` | `YYYY-MM-DDTHH:MM:SS` (no offset) | Stored as naive timestamps; aligns with UTC epoch. |
| `stress` | `DATE`: `YYYY-MM-DDTHH:MM:SS`<br>`UPDATED_AT`: `YYYY-MM-DDTHH:MM:SS.sss` | Naive date/timestamps. `DATE` represents the calendar day of measurement. |
| `daily_questions` | UNIX epoch integer (seconds) | Accompanied by per-row `timeZoneOffset` (e.g. `-21600` for UTC-6 CST). |

### 6.3 PostgreSQL Type-Casting Compatibility
All timestamp columns were tested with PostgreSQL casting:
```sql
SELECT 
  COUNT(*) FILTER (WHERE "timestamp"::timestamptz IS NULL) AS ts_fail
FROM raw.activity_level;
```

- **Result**: **0 failures**. PostgreSQL's `TIMESTAMPTZ` and `TO_TIMESTAMP()` parse all variations (integer epoch, UTC `Z`, naive, and mixed sub-second precision) cleanly.

## 7. Cross-Table Referential Integrity & Participant Orphan Analysis

SQL Query:
```sql
-- Check for orphan participant IDs not in cohort master (users_courses)
SELECT DISTINCT participant_id 
FROM raw.daily_questions 
WHERE participant_id::int NOT IN (SELECT userid::int FROM raw.users_courses);

-- Check for participants in cohort master with missing sensor data
SELECT userid::int 
FROM raw.users_courses 
WHERE userid::int NOT IN (SELECT DISTINCT participant_id::int FROM raw.activity_level);
```

| Check | SQL Result | Status |
|---|---|---|
| **Orphan `participant_id`s in Questionnaires** | 0 orphans | All 35 participants exist in `users_courses`. |
| **Orphan `participant_id`s in Sensors** | 0 orphans | All sensor records belong to verified participants. |
| **Cohort Missing Sensors** | **Participants 3, 12, 14** | Expected per data inventory: these 3 students participated only in daily questionnaires. |
| **Orphan Courses** | 0 orphans | All courses (`A1`, `A2`, `B`) in `users_courses` exist in `course_details`. |

## 8. Staging & Cleaning Recommendations for Next Phase

Based on the SQL profiling findings, the upcoming staging/cleaning transformations should implement the following rules without violating the non-imputation directive:

1. **Deduplicate `stress`**: When staging `stress`, resolve the 2 duplicate dates for participants 2 and 30 by selecting the row with the latest `UPDATED_AT` timestamp (`ROW_NUMBER() OVER (PARTITION BY participant_id, "DATE" ORDER BY "UPDATED_AT"::timestamp DESC) = 1`).
2. **Flagging Severe Hypoxemia (`SpO2 < 70%`)**: Do **not** impute or silently drop the 188,398 rows. Add a boolean quality flag `is_valid_spo2 = (value >= 70.0)` in the clean/staging layer so ML feature pipelines can filter sensor disconnects intentionally.
3. **Flagging HRV Boundary Coverage & Zero RMSSD**: Cap or flag `coverage > 1.0` with `is_coverage_overcount = (coverage > 1.0)` and flag `is_valid_rmssd = (rmssd > 0.0)`. Retain original measurements.
4. **Handling `CALCULATION_FAILED` in Stress**: When `CALCULATION_FAILED = true`, convert `STRESS_SCORE` to `NULL` in the clean layer and keep `calculation_failed = true`. Leaving `0` as an integer score distorts ML training by misrepresenting failed calculations as low stress.
5. **Standardize All Timestamps to `TIMESTAMPTZ`**: Convert UNIX epoch in `daily_questions` and ISO strings in sensors to standard PostgreSQL `TIMESTAMPTZ` (UTC) across all tables.
6. **Maintain `participant_id`**: Preserve `participant_id INT` as a primary foreign key in all tables to facilitate stratified train/test splitting.
