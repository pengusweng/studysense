import os
import sys
import io
import csv
from pathlib import Path
from dotenv import load_dotenv
import psycopg

# Paths
ETL_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = ETL_DIR / "data" / "raw" / "SSAQS dataset"
SQL_DIR = ETL_DIR / "sql"
ENV_FILE = ETL_DIR / ".env"

load_dotenv(dotenv_path=ENV_FILE)

TABLE_SCHEMAS = {
    "course_details": {
        "file_pattern": "course-details.csv",
        "is_participant": False,
        "columns": ["idcourse", "undergraduate", "startDate", "endDate", "semester", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "startTime", "endTime"]
    },
    "users_courses": {
        "file_pattern": "users-courses.csv",
        "is_participant": False,
        "columns": ["participant_id", "userid", "university", "course"]
    },
    "daily_questions": {
        "file_pattern": "daily_questions.csv",
        "is_participant": True,
        "columns": ["participant_id", "timeStampScheduled", "timeStampSent", "timeStampStart", "timeStampStop", "originalTimeStampSent", "timeZoneOffset", "deltaUTC", "stress", "anxiety"]
    },
    "activity_level": {
        "file_pattern": "activity_level.csv",
        "is_participant": True,
        "columns": ["participant_id", "timestamp", "level"]
    },
    "hrv": {
        "file_pattern": "hrv.csv",
        "is_participant": True,
        "columns": ["participant_id", "timestamp", "rmssd", "coverage", "low_frequency", "high_frequency"]
    },
    "oxygen": {
        "file_pattern": "oxygen.csv",
        "is_participant": True,
        "columns": ["participant_id", "timestamp", "value"]
    },
    "sleep": {
        "file_pattern": "sleep.csv",
        "is_participant": True,
        "columns": ["participant_id", "timestamp", "overall_score", "deep_sleep_in_minutes"]
    },
    "steps": {
        "file_pattern": "steps.csv",
        "is_participant": True,
        "columns": ["participant_id", "timestamp", "steps"]
    },
    "stress": {
        "file_pattern": "stress.csv",
        "is_participant": True,
        "columns": ["participant_id", "DATE", "UPDATED_AT", "STRESS_SCORE", "CALCULATION_FAILED"]
    }
}

def get_connection():
    # Prefer DIRECT_URL (session pooler, port 5432) for DDL & COPY, fallback to DATABASE_URL
    db_url = os.getenv("DIRECT_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("Neither DIRECT_URL nor DATABASE_URL found in .env file.")
    # Clean up unsupported query parameters for psycopg (e.g. ?pgbouncer=true)
    if "?" in db_url:
        base, query = db_url.split("?", 1)
        # remove pgbouncer parameter
        params = [p for p in query.split("&") if not p.startswith("pgbouncer=")]
        db_url = base + ("?" + "&".join(params) if params else "")
    return psycopg.connect(db_url)

def init_raw_schema(conn):
    schema_sql_path = SQL_DIR / "01_raw_schema.sql"
    with open(schema_sql_path, "r", encoding="utf-8") as f:
        sql = f.read()
    with conn.cursor() as cur:
        cur.execute(sql)
        # Idempotency: truncate all raw tables before loading
        print("Truncating existing raw tables for idempotent load...")
        for table in TABLE_SCHEMAS.keys():
            cur.execute(f'TRUNCATE TABLE raw."{table}";')
    conn.commit()

def load_root_csv(conn, table_name):
    cfg = TABLE_SCHEMAS[table_name]
    file_path = DATA_DIR / cfg["file_pattern"]
    if not file_path.exists():
        print(f"Warning: {file_path} not found.")
        return 0

    row_count = 0
    cols = cfg["columns"]
    col_str = ", ".join(f'"{c}"' for c in cols)
    copy_sql = f'COPY raw."{table_name}" ({col_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)'

    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")

    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)  # skip header
        for row in reader:
            if not row:
                continue
            if table_name == "users_courses":
                # inject participant_id equal to userid
                userid = row[0]
                writer.writerow([userid] + row)
            else:
                writer.writerow(row)
            row_count += 1

    buffer.seek(0)
    with conn.cursor() as cur:
        with cur.copy(copy_sql) as copy:
            copy.write(buffer.read())
    conn.commit()
    return row_count

def load_participant_csv(conn, table_name):
    cfg = TABLE_SCHEMAS[table_name]
    cols = cfg["columns"]
    col_str = ", ".join(f'"{c}"' for c in cols)
    copy_sql = f'COPY raw."{table_name}" ({col_str}) FROM STDIN WITH (FORMAT CSV, HEADER FALSE)'

    total_rows = 0
    buffer = io.StringIO()
    writer = csv.writer(buffer, lineterminator="\n")
    BATCH_SIZE = 50000

    with conn.cursor() as cur:
        with cur.copy(copy_sql) as copy:
            for p in range(1, 36):
                file_path = DATA_DIR / str(p) / cfg["file_pattern"]
                if not file_path.exists():
                    continue

                with open(file_path, "r", encoding="utf-8") as f:
                    reader = csv.reader(f)
                    header = next(reader)  # skip header
                    for row in reader:
                        if not row:
                            continue
                        writer.writerow([str(p)] + row)
                        total_rows += 1

                        if total_rows % BATCH_SIZE == 0:
                            buffer.seek(0)
                            copy.write(buffer.read())
                            buffer.seek(0)
                            buffer.truncate(0)

            # Flush remaining buffer
            if buffer.tell() > 0:
                buffer.seek(0)
                copy.write(buffer.read())

    conn.commit()
    return total_rows

def verify_counts(conn, expected_counts):
    print("\n--- Verifying Row Counts in PostgreSQL raw schema ---")
    all_match = True
    with conn.cursor() as cur:
        for table, expected in expected_counts.items():
            cur.execute(f'SELECT COUNT(*) FROM raw."{table}";')
            actual = cur.fetchone()[0]
            status = "MATCH" if actual == expected else "MISMATCH"
            print(f"  raw.{table:18} Expected: {expected:10,d} | In DB: {actual:10,d} -> {status}")
            if actual != expected:
                all_match = False
    return all_match

def main():
    print("Connecting to database...")
    with get_connection() as conn:
        print("Initializing raw schema and tables...")
        init_raw_schema(conn)

        expected_counts = {}

        # 1. Load Root Files
        print("Loading root metadata CSVs...")
        for tbl in ["course_details", "users_courses"]:
            rows = load_root_csv(conn, tbl)
            expected_counts[tbl] = rows
            print(f"  Loaded raw.{tbl}: {rows:,} rows")

        # 2. Load Participant Files
        print("Loading participant CSVs...")
        for tbl in ["daily_questions", "activity_level", "hrv", "oxygen", "sleep", "steps", "stress"]:
            rows = load_participant_csv(conn, tbl)
            expected_counts[tbl] = rows
            print(f"  Loaded raw.{tbl}: {rows:,} rows")

        # 3. Verification
        success = verify_counts(conn, expected_counts)
        if success:
            print("\nETL Raw Layer loaded and verified successfully!")
        else:
            print("\nWARNING: Row count verification failed!")
            sys.exit(1)

if __name__ == "__main__":
    main()
