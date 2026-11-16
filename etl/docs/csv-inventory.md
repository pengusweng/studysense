# SSAQS Dataset CSV Inventory & Data Dictionary

This document provides a comprehensive inventory of all raw CSV files in the SSAQS dataset (`data/raw/SSAQS dataset`), detailing row counts, column types, null percentages, distinct counts, sample values, duplicate row analysis, timestamp ranges, keys, timezones, and dataset classifications.

## Executive Summary

- **Total Files**: 229 CSV files across root and 35 participant directories.
- **Total Records**: 3,561,525 rows across all files.
- **Total Participants**: 35 participants (IDs 1 through 35).
- **Sensors vs. Questionnaires**:
  - **Questionnaires**: 35 files (`daily_questions.csv`, 3,133 total rows). All 35 participants have questionnaire records.
  - **Sensor Data (Fitbit Inspire 3)**: 192 files across 6 modalities (`activity_level.csv`, `hrv.csv`, `oxygen.csv`, `sleep.csv`, `steps.csv`, `stress.csv`). 32 participants have sensor data (3,558,354 total rows).
  - **Missing Sensors**: Participants `3`, `12`, and `14` have **no wearable sensor data** (only `daily_questions.csv`).
  - **Reference/Metadata**: 2 root files (`course-details.csv` with 3 rows, `users-courses.csv` with 35 rows).
- **Data Hygiene Highlights**:
  - **Null Values**: Exactly 0.0% nulls across all 229 files (no raw null/NaN values).
  - **File-Level Duplicate Rows**: Exactly 0 duplicate rows across all individual CSV files.
  - **Intra-File Duplicate Dates**: In `stress.csv`, participant 2 (date `2025-05-06`) and participant 30 (date `2025-04-21`) each have 2 rows for the same `DATE` but different `UPDATED_AT` timestamps due to calculation updates.
  - **Cross-Participant Collision**: Files inside participant directories lack a `participant_id` column inside the CSV. Without injecting `participant_id` from the directory structure, sensor records from different students collide.

## Keys, Identifiers, and Timezones

| Category | Dimension | Details |
|---|---|---|
| **Participant Key** | Identification | Derived from directory folder name (`1` to `35`) for participant files; explicitly named `userid` in `users-courses.csv`. Individual CSVs inside participant folders do not contain participant identifiers. |
| **Date / Time Keys** | `daily_questions.csv` | `timeStampScheduled`, `timeStampSent`, `timeStampStart`, `timeStampStop`, `originalTimeStampSent` (integer UNIX epoch timestamps in seconds). |
| | `activity_level.csv` | `timestamp` (ISO 8601 string, UTC with `Z`). |
| | `oxygen.csv` | `timestamp` (ISO 8601 string, UTC with `Z`). |
| | `sleep.csv` | `timestamp` (ISO 8601 string, UTC with `Z`). |
| | `steps.csv` | `timestamp` (ISO 8601 string, UTC with `Z`). |
| | `hrv.csv` | `timestamp` (ISO 8601 naive timestamp `YYYY-MM-DDTHH:MM:SS`, UTC). |
| | `stress.csv` | `DATE` (midnight date string `YYYY-MM-DDTHH:MM:SS`) and `UPDATED_AT` (`YYYY-MM-DDTHH:MM:SS.sss`). |
| | `course-details.csv` | `startDate`, `endDate` (`M/D/YYYY`), `startTime`, `endTime` (`H:MM`). |
| **Timezone Handling** | Fitbit sensors | `activity_level`, `oxygen`, `sleep`, and `steps` record UTC timestamps ending with `Z`. `hrv` and `stress` record ISO strings without offset. |
| | Daily questions | Contains explicit `timeZoneOffset` (seconds from UTC, primarily `-21600` = UTC-6 CST, plus `-25200` = UTC-7, `-18000` = UTC-5, `-14400` = UTC-4, and `7200` = UTC+2) and `deltaUTC`. |

## File Classifications

### 1. Questionnaire / Self-Report Data
- **`daily_questions.csv`**: Daily Ecological Momentary Assessment (EMA) self-reports measuring subjective stress and anxiety levels (0-100 scale), scheduled twice per day (typically morning and evening).

### 2. Wearable Sensor Data (Fitbit Inspire 3)
- **`activity_level.csv`**: Minute-by-minute activity classification (`SEDENTARY`, `LIGHTLY_ACTIVE`, `MODERATELY_ACTIVE`, `VERY_ACTIVE`).
- **`steps.csv`**: Minute-by-minute step count counts (1 to 1,118 steps/min).
- **`oxygen.csv`**: Minute-by-minute blood oxygen saturation percentage (`SpO2`, 50.0% to 100.0%).
- **`hrv.csv`**: 5-minute interval Heart Rate Variability metrics (`rmssd`, `coverage`, `low_frequency`, `high_frequency`).
- **`sleep.csv`**: Daily sleep summary logs (`overall_score` 40-94, `deep_sleep_in_minutes` 5-177 min).
- **`stress.csv`**: Daily Fitbit stress management score (`STRESS_SCORE` 0-96, `CALCULATION_FAILED` boolean, `UPDATED_AT` timestamp).

### 3. Academic & Demographic Metadata
- **`course-details.csv`**: Course schedule information (semester, days of week, start/end times and dates).
- **`users-courses.csv`**: Participant mapping to enrolled university (1 or 2) and course section (A1, A2, B).

## Detailed File Type Specifications & Data Dictionary

### `daily_questions.csv`
- **Description**: Questionnaire: Daily Self-Reports (Stress & Anxiety)
- **File Count**: 35
- **Total Rows**: 3,133
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timeStampScheduled`: 2025-02-14 21:07:25 UTC to 2025-07-09 22:23:30 UTC
  - `timeStampSent`: 2025-02-14 21:07:27 UTC to 2025-07-09 22:23:31 UTC
  - `timeStampStart`: 2025-02-14 21:07:47 UTC to 2025-07-09 22:23:52 UTC
  - `timeStampStop`: 2025-02-14 21:07:57 UTC to 2025-07-09 22:23:56 UTC

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timeStampScheduled` | `int64` | 0.0% | 2,623 | `1739567245` | `1752099810` | `1739999335`, `1740082074`, `1740174744` |  |
| `timeStampSent` | `int64` | 0.0% | 2,625 | `1739567247` | `1752099811` | `1739999336`, `1740082078`, `1740174747` |  |
| `timeStampStart` | `int64` | 0.0% | 3,121 | `1739567267` | `1752099832` | `1740000118`, `1740082084`, `1740174759` |  |
| `timeStampStop` | `int64` | 0.0% | 3,127 | `1739567277` | `1752099836` | `1740000146`, `1740082096`, `1740174772` |  |
| `originalTimeStampSent` | `int64` | 0.0% | 1,134 | `0` | `1752098010` | `0`, `1740773416`, `1740861387` | 0 represents initial send without resend/delay |
| `timeZoneOffset` | `int64` | 0.0% | 5 | `-25200` | `7200` | `-21600`, `-25200`, `-18000` | Seconds offset from UTC (-21600 = UTC-6 / CST) |
| `deltaUTC` | `int64` | 0.0% | 34 | `-21` | `25` | `0`, `-3`, `-1` |  |
| `stress` | `int64` | 0.0% | 101 | `0` | `100` | `15`, `33`, `12` | Self-report scale 0-100 |
| `anxiety` | `int64` | 0.0% | 101 | `0` | `100` | `0`, `8`, `7` | Self-report scale 0-100 |


### `activity_level.csv`
- **Description**: Sensor: Minute-Level Physical Activity Levels
- **File Count**: 32
- **Total Rows**: 1,766,244
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timestamp`: 2025-02-18T02:50:40Z to 2025-07-01T13:42:00Z (UTC)

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timestamp` | `str` | 0.0% | 192,354 | `2025-02-18T02:50:40Z` | `2025-07-01T13:42:00Z` | `2025-02-21T12:58:00Z`, `2025-02-21T12:59:00Z`, `2025-02-21T13:00:00Z` |  |
| `level` | `str` | 0.0% | 4 | `LIGHTLY_ACTIVE` | `VERY_ACTIVE` | `SEDENTARY`, `LIGHTLY_ACTIVE`, `VERY_ACTIVE` | SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE |


### `hrv.csv`
- **Description**: Sensor: Heart Rate Variability (5-Minute Windows)
- **File Count**: 32
- **Total Rows**: 151,243
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timestamp`: 2025-02-18T00:00:00 to 2025-06-30T08:45:00

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timestamp` | `str` | 0.0% | 21,686 | `2025-02-18T00:00:00` | `2025-06-30T08:45:00` | `2025-02-23T00:00:00`, `2025-02-23T00:05:00`, `2025-02-23T00:10:00` |  |
| `rmssd` | `float64` | 0.0% | 90,418 | `0.0` | `704.909` | `61.898`, `51.375`, `56.179` | Root mean square of successive differences (ms) |
| `coverage` | `float64` | 0.0% | 335 | `0.7` | `1.056` | `0.891`, `0.913`, `0.918` | Data capture ratio in 5-min window |
| `low_frequency` | `float64` | 0.0% | 148,096 | `8.122` | `87266.924` | `2803.586`, `1274.034`, `1063.565` |  |
| `high_frequency` | `float64` | 0.0% | 147,092 | `3.624` | `53274.904` | `1104.135`, `747.731`, `1199.898` |  |


### `oxygen.csv`
- **Description**: Sensor: Minute-Level Blood Oxygen Saturation (SpO2)
- **File Count**: 32
- **Total Rows**: 978,367
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timestamp`: 2025-02-18T04:58:33Z to 2025-07-01T13:03:03Z (UTC)

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timestamp` | `str` | 0.0% | 363,019 | `2025-02-18T04:58:33Z` | `2025-07-01T13:03:03Z` | `2025-02-21T19:57:03Z`, `2025-02-21T19:58:03Z`, `2025-02-21T19:59:03Z` |  |
| `value` | `float64` | 0.0% | 264 | `50.0` | `100.0` | `86.4`, `50.0`, `84.3` |  |


### `sleep.csv`
- **Description**: Sensor: Daily Sleep Log Summary
- **File Count**: 32
- **Total Rows**: 1,829
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timestamp`: 2025-02-18T08:41:30Z to 2025-07-01T07:43:30Z (UTC)

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timestamp` | `str` | 0.0% | 1,811 | `2025-02-18T08:41:30Z` | `2025-07-01T07:43:30Z` | `2025-02-23T07:44:30Z`, `2025-02-24T05:55:30Z`, `2025-02-25T05:52:00Z` |  |
| `overall_score` | `int64` | 0.0% | 51 | `40` | `94` | `78`, `85`, `82` |  |
| `deep_sleep_in_minutes` | `int64` | 0.0% | 142 | `5` | `177` | `61`, `78`, `88` |  |


### `steps.csv`
- **Description**: Sensor: Minute-Level Step Counts
- **File Count**: 32
- **Total Rows**: 658,894
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `timestamp`: 2025-02-18T02:50:40Z to 2025-07-01T13:31:00Z (UTC)

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `timestamp` | `str` | 0.0% | 161,977 | `2025-02-18T02:50:40Z` | `2025-07-01T13:31:00Z` | `2025-02-21T12:59:00Z`, `2025-02-21T13:06:00Z`, `2025-02-21T13:11:00Z` |  |
| `steps` | `int64` | 0.0% | 699 | `1` | `1118` | `12`, `11`, `10` |  |


### `stress.csv`
- **Description**: Sensor: Daily Stress Score & Calculation Log
- **File Count**: 32
- **Total Rows**: 1,777
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `DATE`: 2025-02-18T00:00:00 to 2025-07-01T00:00:00
  - `UPDATED_AT`: 2025-02-18T11:42:48.719 to 2025-07-01T13:44:56.527

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `DATE` | `str` | 0.0% | 130 | `2025-02-18T00:00:00` | `2025-07-01T00:00:00` | `2025-02-22T00:00:00`, `2025-02-23T00:00:00`, `2025-02-24T00:00:00` |  |
| `UPDATED_AT` | `str` | 0.0% | 1,777 | `2025-02-18T11:42:48.719` | `2025-07-01T13:44:56.527` | `2025-02-22T14:48:19.146`, `2025-02-23T16:19:33.208`, `2025-02-24T11:56:58.992` |  |
| `STRESS_SCORE` | `int64` | 0.0% | 41 | `0` | `96` | `0`, `58`, `71` |  |
| `CALCULATION_FAILED` | `bool` | 0.0% | 2 | `False` | `True` | `True`, `False` | When True, STRESS_SCORE is 0 |


### `course-details.csv`
- **Description**: Metadata: Course Schedules & Semester Dates
- **File Count**: 1
- **Total Rows**: 3
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)
- **Date/Timestamp Ranges**:
  - `startDate` to `endDate`: 2/10/2025 to 7/11/2025
  - `startTime` to `endTime`: 7:00 to 19:00

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `idcourse` | `str` | 0.0% | 3 | `A1` | `B` | `A1`, `A2`, `B` |  |
| `undergraduate` | `int64` | 0.0% | 1 | `1` | `1` | `1` |  |
| `startDate` | `str` | 0.0% | 1 | `2/10/2025` | `2/10/2025` | `2/10/2025` |  |
| `endDate` | `str` | 0.0% | 2 | `6/15/2025` | `7/11/2025` | `6/15/2025`, `7/11/2025` |  |
| `semester` | `int64` | 0.0% | 2 | `4` | `6` | `4`, `6` |  |
| `Monday` | `int64` | 0.0% | 1 | `1` | `1` | `1` |  |
| `Tuesday` | `int64` | 0.0% | 2 | `0` | `1` | `0`, `1` |  |
| `Wednesday` | `int64` | 0.0% | 1 | `0` | `0` | `0` |  |
| `Thursday` | `int64` | 0.0% | 1 | `1` | `1` | `1` |  |
| `Friday` | `int64` | 0.0% | 1 | `0` | `0` | `0` |  |
| `startTime` | `str` | 0.0% | 3 | `17:00` | `9:30` | `7:00`, `17:00`, `9:30` |  |
| `endTime` | `str` | 0.0% | 3 | `11:00` | `9:00` | `9:00`, `19:00`, `11:00` |  |


### `users-courses.csv`
- **Description**: Metadata: Participant Enrolled Courses & Universities
- **File Count**: 1
- **Total Rows**: 35
- **Duplicate Rows (per file)**: 0 (100% unique per participant file)

**Columns & Types**:

| Column Name | Inferred Dtype | Null % | Distinct Values | Min Value | Max Value | Example Values | Notes |
|---|---|---|---|---|---|---|---|
| `userid` | `int64` | 0.0% | 35 | `1` | `35` | `1`, `2`, `3` |  |
| `university` | `int64` | 0.0% | 2 | `1` | `2` | `1`, `2` |  |
| `course` | `str` | 0.0% | 3 | `A1` | `B` | `A1`, `A2`, `B` |  |


## Participant Coverage Matrix

This matrix outlines record counts per file type for each of the 35 participants.

| Participant ID | Total Rows | Daily Questions | Activity Level | HRV | Oxygen (SpO2) | Sleep | Steps | Stress | Wearable Status |
|---|---|---|---|---|---|---|---|---|---|
| Participant 1 | 87,940 | 121 | 53,975 | 2,930 | 17,788 | 31 | 13,067 | 28 | Active |
| Participant 2 | 61,917 | 102 | 36,316 | 698 | 12,317 | 10 | 12,464 | 10 | Active |
| Participant 3 | 14 | 14 | 0 | 0 | 0 | 0 | 0 | 0 | **Missing Wearables** |
| Participant 4 | 40,180 | 118 | 23,715 | 1,217 | 10,296 | 13 | 4,812 | 9 | Active |
| Participant 5 | 151,875 | 135 | 75,180 | 6,754 | 43,156 | 100 | 26,461 | 89 | Active |
| Participant 6 | 104,017 | 105 | 50,036 | 4,375 | 26,713 | 44 | 22,695 | 49 | Active |
| Participant 7 | 173,186 | 103 | 91,140 | 7,636 | 43,232 | 95 | 30,896 | 84 | Active |
| Participant 8 | 166,342 | 104 | 76,525 | 8,385 | 50,475 | 103 | 30,659 | 91 | Active |
| Participant 9 | 131,828 | 60 | 66,060 | 5,745 | 36,774 | 63 | 23,063 | 63 | Active |
| Participant 10 | 94,645 | 115 | 48,406 | 3,456 | 22,849 | 42 | 19,739 | 38 | Active |
| Participant 11 | 78,442 | 39 | 42,390 | 2,120 | 15,949 | 26 | 17,890 | 28 | Active |
| Participant 12 | 55 | 55 | 0 | 0 | 0 | 0 | 0 | 0 | **Missing Wearables** |
| Participant 13 | 134,988 | 88 | 63,841 | 7,010 | 41,817 | 88 | 22,068 | 76 | Active |
| Participant 14 | 40 | 40 | 0 | 0 | 0 | 0 | 0 | 0 | **Missing Wearables** |
| Participant 15 | 52,274 | 59 | 26,695 | 2,123 | 13,249 | 25 | 10,105 | 18 | Active |
| Participant 16 | 110,756 | 71 | 48,506 | 5,774 | 38,349 | 69 | 17,923 | 64 | Active |
| Participant 17 | 58,611 | 116 | 35,659 | 1,355 | 11,265 | 14 | 10,185 | 17 | Active |
| Participant 18 | 103,913 | 83 | 50,607 | 4,672 | 32,064 | 56 | 16,382 | 49 | Active |
| Participant 19 | 82,119 | 116 | 38,396 | 4,556 | 27,540 | 49 | 11,416 | 46 | Active |
| Participant 20 | 148,289 | 100 | 83,082 | 5,398 | 35,145 | 69 | 24,425 | 70 | Active |
| Participant 21 | 75,531 | 59 | 42,105 | 2,131 | 17,191 | 32 | 13,981 | 32 | Active |
| Participant 22 | 133,594 | 117 | 68,352 | 3,724 | 34,796 | 49 | 26,500 | 56 | Active |
| Participant 23 | 90,500 | 76 | 44,536 | 3,783 | 23,986 | 43 | 18,029 | 47 | Active |
| Participant 24 | 191,807 | 108 | 95,232 | 8,349 | 49,083 | 103 | 38,829 | 103 | Active |
| Participant 25 | 64,748 | 7 | 27,234 | 3,605 | 22,137 | 38 | 11,689 | 38 | Active |
| Participant 26 | 139,655 | 102 | 59,938 | 8,274 | 46,713 | 88 | 24,453 | 87 | Active |
| Participant 27 | 182,084 | 116 | 84,028 | 7,765 | 53,160 | 97 | 36,823 | 95 | Active |
| Participant 28 | 124,006 | 108 | 62,326 | 5,832 | 34,522 | 67 | 21,088 | 63 | Active |
| Participant 29 | 75,337 | 115 | 36,465 | 3,207 | 22,687 | 43 | 12,773 | 47 | Active |
| Participant 30 | 131,523 | 108 | 62,887 | 5,247 | 38,782 | 77 | 24,350 | 72 | Active |
| Participant 31 | 81,730 | 50 | 41,382 | 2,144 | 16,479 | 27 | 21,606 | 42 | Active |
| Participant 32 | 153,650 | 116 | 77,079 | 7,238 | 40,383 | 80 | 28,669 | 85 | Active |
| Participant 33 | 104,719 | 115 | 42,655 | 6,552 | 43,648 | 78 | 11,600 | 71 | Active |
| Participant 34 | 164,684 | 111 | 82,552 | 5,713 | 35,914 | 75 | 40,245 | 74 | Active |
| Participant 35 | 66,488 | 81 | 28,944 | 3,475 | 19,908 | 35 | 14,009 | 36 | Active |

## ETL Considerations & Observations

1. **Participant Identifier Injection**: None of the CSV files inside participant folders include `participant_id`. The directory name must be extracted and injected into each table as an integer `participant_id` (foreign key to `users-courses.userid`).
2. **Missing Wearable Data Handling**: Participants 3, 12, and 14 have only questionnaire data and zero sensor records. They must remain in participants/questionnaires tables; sensor tables simply won't have rows for them.
3. **Timestamp Standardization**: Timestamps arrive in multiple formats (UNIX epoch integer in seconds, ISO 8601 with trailing `Z`, and ISO 8601 naive timestamp strings). PostgreSQL `TIMESTAMPTZ` should be used consistently with appropriate UTC conversion.
4. **`stress.csv` Intra-Participant Duplicate Dates**: 2 participant dates (`participant_id=2, DATE='2025-05-06'` and `participant_id=30, DATE='2025-04-21'`) have multiple entries corresponding to updated calculations. The ETL must define a deterministic resolution strategy (e.g., retaining the latest `UPDATED_AT` record or using `(participant_id, DATE, UPDATED_AT)` as a composite key).
5. **Semantic Nulls / Sentinels**: `originalTimeStampSent = 0` in questionnaires and `STRESS_SCORE = 0` when `CALCULATION_FAILED = True` are sentinel values that require explicit handling in downstream ML features without silent deletion.
