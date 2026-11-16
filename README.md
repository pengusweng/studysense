# StudySense: An Empathic Academic Support System

> Multi-modal affective computing system leveraging wearable physiological sensor data and student self-reports to detect, monitor, and alleviate academic stress and anxiety.

---

## Repository Modules

- **`etl/`**: Production Python ETL pipeline for ingesting, transforming, and temporally aligning the **SSAQS dataset** into PostgreSQL on Supabase.
  - Implements fast bulk `COPY` and atomic idempotent `INSERT ... ON CONFLICT` upserts.
  - Produces the ML-ready dataset [`clean.daily_features`](file:///C:/dev/studysense-empathic-system/etl/sql/002_daily_alignment.sql) and [`clean.v_ml_ready_daily_features`](file:///C:/dev/studysense-empathic-system/etl/sql/002_daily_alignment.sql).
  - Full documentation, setup instructions, and CLI usage details are available in [`etl/README.md`](file:///C:/dev/studysense-empathic-system/etl/README.md).

---

## Quickstart

```powershell
cd etl
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Run full ETL pipeline (raw -> clean -> align -> validate)
python -m etl.run

# Run automated validation suite (exit code 0 on success)
python -m src.validate

# Run pytest unit & integration test suite (23 passing tests)
python -m pytest
```

See [`etl/README.md`](file:///C:/dev/studysense-empathic-system/etl/README.md) for complete details.
