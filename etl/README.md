# StudySense ETL Pipeline

> Production-grade Python ETL pipeline ingesting, cleaning, and temporally aligning the **SSAQS dataset** (Students' Stress and Anxiety Questionnaires & Sensors) into PostgreSQL (by default the project's local Docker Postgres).

---

## 1. Overview & Architecture

StudySense processes multi-modal time-series data collected from 35 university students between **February and July 2025**:
- **Passive Wearables**: Continuous minute-by-minute biometric sensor streams from **Fitbit Inspire 3** (steps, physical activity intensity, heart rate variability, SpO2 blood oxygenation, sleep architecture, stress scores).
- **Active Ground Truth**: Daily Ecological Momentary Assessment (EMA) self-report questionnaires rating psychological stress and anxiety on a Visual Analog Scale (0–100).

```mermaid
flowchart TD
    CSV["data/raw/SSAQS dataset/ (229 CSVs)"] -->|Fast COPY| Raw["raw.* Schema (9 tables, 3.56M rows)"]
    Raw -->|Pure Transforms| Transform["src.transform Module"]
    Transform -->|Audit Rejections| RejectLog["clean.rejected_records & logs/rejected_records.csv"]
    Transform -->|Chunked COPY| Staging["staging.* Unlogged Buffers (< 10MB)"]
    Staging -->|INSERT ... ON CONFLICT| Clean["clean.* Schema (Fact & Dim Tables)"]
    Clean -->|SQL Aggregation CTE| DailyFeatures["clean.daily_features (3,618 Participant-Days)"]
    DailyFeatures -->|Filter complete cohort| MLView["clean.v_ml_ready_daily_features (2,291 ML-ready)"]
    DailyFeatures -->|Integrity Gate| Validate["src.validate Suite (4 Suites, Exit Code 0)"]
```

---

## 2. Directory Structure

```text
etl/
├── src/
│   ├── transform.py          # Pure transformation functions, string/date parsers & quality flags
│   ├── load.py               # Staged COPY & upsert loader with bounded memory chunking
│   ├── load_raw.py           # Ingestion from raw CSV files into PostgreSQL raw schema
│   ├── validate.py           # Integrity, reconciliation, range, and idempotency validation
│   └── __init__.py
├── sql/
│   ├── 01_raw_schema.sql                # DDL for raw text tables (all columns TEXT)
│   ├── 001_clean_schema.sql            # DDL for typed clean tables, PKs, FKs, and constraints
│   ├── 002_daily_alignment.sql         # Participant-day temporal alignment & ML view
│   └── 003_staging_and_reject_schema.sql # Unlogged staging tables & rejection audit table
├── tests/
│   ├── test_transform.py     # Unit tests for pure transform functions (15 tests)
│   ├── test_load.py          # Unit tests for staging, buffer formatting, and upsert logic (4 tests)
│   └── test_validate.py      # Integration tests for reconciliation and range constraints (4 tests)
├── docs/
│   ├── csv-inventory.md      # Full inventory of all 229 raw CSV files and column metadata
│   ├── profile.md            # Data profiling: nulls, sentinels, distributions, and artifacts
│   ├── time-alignment.md     # Temporal alignment rationale and aggregation formulas
│   ├── data-dictionary.md    # Comprehensive dictionary for all 36 columns in clean.daily_features
│   ├── rejected_records.md   # Audit log of dropped superseded measurements
│   └── validation-report.md  # Detailed verification report of all validation checks
├── logs/
│   └── rejected_records.csv  # Machine-readable audit file of rejected rows
├── run.py                    # Unified CLI entry point (python -m etl.run)
└── requirements.txt          # Python dependencies
```

---

## 3. Setup & Installation

### 3.1. Prerequisites
- Python 3.12+ (tested on Python 3.14)
- PostgreSQL 15+. The default is the repo's Docker Postgres (`docker compose up -d db` from the repo root, host port 6000); any hosted Postgres works too

### 3.2. Environment Configuration
Clone the repository and create a Python virtual environment:

```powershell
cd C:\dev\studysense-empathic-system\etl

# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Start the database and create `etl/.env` from the example (never commit `.env`):

```powershell
# From the repo root
docker compose up -d db
copy etl\.env.example etl\.env
```

```env
# Local Docker Postgres (docker-compose.yml, host port 6000)
DATABASE_URL=postgresql://studysense:studysense@127.0.0.1:6000/studysense
DIRECT_URL=postgresql://studysense:studysense@127.0.0.1:6000/studysense
```

The ETL writes to the `raw`, `clean` and `staging` schemas. The API's event log uses its own `app` schema in the same database, so they don't collide. To use a hosted Postgres instead, put its connection strings here; a Prisma-style `?pgbouncer=true` is stripped automatically.

---

## 4. How to Run

The pipeline is managed via a single CLI orchestrator: `python -m etl.run`.

### 4.1. Run the Full End-to-End Pipeline
Executes all four stages in sequence (`raw` $\to$ `clean` $\to$ `align` $\to$ `validate`) and displays an execution summary:
```powershell
python -m etl.run
```

### 4.2. Selective Step Execution
Run individual stages using the `--only` flag:
```powershell
# 1. Ingest raw CSVs into raw schema
python -m etl.run --only raw

# 2. Transform and upsert fact & dimension tables into clean schema
python -m etl.run --only clean

# 3. Refresh participant-day alignment table (clean.daily_features)
python -m etl.run --only align

# 4. Run validation checks
python -m etl.run --only validate
```

### 4.3. Dry-Run Mode
Inspect discovered CSVs, test database connectivity, and view current row counts without making any database changes:
```powershell
python -m etl.run --dry-run
```

### 4.4. Full Refresh Mode
Truncates clean tables before loading to rebuild the clean layer from scratch:
```powershell
python -m etl.run --full-refresh
```

---

## 5. How to Validate & Test

### 5.1. Automated Validation Suite
The validation suite enforces pipeline integrity and exits with code `0` on success, or non-zero (`1`) on any failure:

```powershell
python -m src.validate
```

The validator verifies four critical properties:
1. **Row Count Reconciliation**: Total raw rows (`3,561,525`) reconcile 100% against clean rows (`3,561,523`) + audited rejections (`2`).
2. **Key Uniqueness & Referential Integrity**: `0` duplicate primary keys across all 10 clean tables; `0` orphan foreign keys.
3. **Range & Temporal Bounds**: All values obey biological bounds; all dates fall within the **February to July 2025** study period.
4. **Idempotency**: Re-running the pipeline leaves table row counts and states unchanged ($\Delta = 0$).

Fast mode (skips the re-run check for quick CI validation):
```powershell
python -m src.validate --skip-rerun
```

### 5.2. Pytest Unit & Integration Tests
Execute the automated test suite (23 passing tests):
```powershell
python -m pytest
```

---

## 6. Schema & Data Overview

### 6.1. Raw Layer (`raw` schema)
- `raw.course_details`: Academic schedules and calendar dates.
- `raw.users_courses`: Participant enrollment and course links.
- `raw.daily_questions`: EMA survey submissions.
- `raw.steps`, `raw.activity_level`, `raw.hrv`, `raw.oxygen`, `raw.sleep`, `raw.stress`: Raw Fitbit sensor streams.

### 6.2. Clean Layer (`clean` schema)
- **Dimensions**:
  - `clean.courses` (PK: `course_id`): Course schedules and dates.
  - `clean.participants` (PK: `participant_id`, FK: `clean.courses`): Enrolled cohort metadata.
- **Daily Facts**:
  - `clean.daily_questions` (PK: `(participant_id, scheduled_at)`): Typed EMA surveys in UTC.
  - `clean.stress` (PK: `(participant_id, measurement_date)`): Stress score with calculation failure flags.
  - `clean.sleep` (PK: `(participant_id, timestamp)`): Nightly sleep score & deep sleep duration.
  - `clean.oxygen` (PK: `(participant_id, timestamp)`): SpO2 readings with artifact indicators.
  - `clean.steps` (PK: `(participant_id, timestamp)`): Minute-level steps with cadence intensity flags.
  - `clean.activity_level` (PK: `(participant_id, timestamp)`): Sedentary, light, moderate, and very active epochs.
  - `clean.hrv` (PK: `(participant_id, timestamp)`): 5-minute rolling RMSSD, coverage, LF, and HF metrics.
- **Audit Table**:
  - `clean.rejected_records`: Audited log of superseded duplicate calculations with JSON payloads.

### 6.3. Machine Learning Output (`clean.daily_features`)
- **Unit of Analysis**: One row per participant per calendar day (`participant_id`, `date`).
- **Features**: Aggregated daily steps, active minutes, physical activity distributions, sleep architecture, HRV RMSSD/coverage/LF/HF, SpO2 mean/min/max.
- **Labels**: Daily mean, min, and max self-reported stress and anxiety ratings from EMA questionnaires.
- **Modality Flags**: `has_sensor_data`, `has_questionnaire_data`, `has_both_modalities`.
- **Training View (`clean.v_ml_ready_daily_features`)**:
  ```sql
  SELECT * FROM clean.v_ml_ready_daily_features;
  ```
  Isolates the **2,291 ML-ready observations** having both wearable features and ground-truth survey labels.

For full column descriptions, engineering units, formulas, and cross-validation recommendations (`GroupKFold` on `participant_id`), see [`docs/data-dictionary.md`](file:///C:/dev/studysense-empathic-system/etl/docs/data-dictionary.md).
