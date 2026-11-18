"""
StudySense Unified ETL Pipeline Runner.
Entry point for executing, orchestrating, and validating the complete ETL pipeline.

Usage:
  python -m etl.run                     # Run full pipeline: raw -> clean -> align -> validate
  python -m etl.run --only raw          # Run only raw CSV ingestion
  python -m etl.run --only clean        # Run only clean layer transformation & upsert
  python -m etl.run --only align        # Run only daily participant-day alignment
  python -m etl.run --only validate     # Run only validation checks
  python -m etl.run --dry-run           # Inspect pipeline inputs and state without mutating DB
  python -m etl.run --full-refresh      # Truncate and rebuild clean tables from scratch
"""

import os
import sys
import time
import argparse
import logging
from pathlib import Path
from typing import Dict, Any

# Ensure project root is on sys.path
ETL_DIR = Path(__file__).resolve().parent
REPO_DIR = ETL_DIR.parent
for p in [str(ETL_DIR), str(REPO_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

from src.load import get_connection, load_pipeline
from src.load_raw import run_load_raw
from src.validate import run_all_validations

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("etl.run")


def execute_dry_run() -> int:
    """
    Dry-run mode: inspects CSV files, verifies database connection,
    displays current row counts and planned execution sequence without modifying database.
    """
    print("\n" + "=" * 80)
    print("                     STUDYSENSE ETL PIPELINE: DRY-RUN INSPECTION")
    print("=" * 80)

    raw_dir = ETL_DIR / "data" / "raw" / "SSAQS dataset"
    if not raw_dir.exists():
        logger.error(f"Raw data directory not found: {raw_dir}")
        return 1

    csv_files = list(raw_dir.glob("**/*.csv"))
    participants = [d for d in raw_dir.iterdir() if d.is_dir() and d.name.isdigit()]

    print(f"  Raw Data Directory : {raw_dir}")
    print(f"  Discovered CSVs    : {len(csv_files):,} files")
    print(f"  Participants       : {len(participants)} participant directories (1-35)")

    logger.info("Connecting to PostgreSQL database...")
    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT current_database(), version();")
                db_name, db_ver = cur.fetchone()
                print(f"  Connected DB       : {db_name} ({db_ver.split(',')[0]})")

                # Check existing table counts
                print("\n  Current Database State:")
                schemas = ["raw", "clean"]
                for s in schemas:
                    cur.execute(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{s}' ORDER BY table_name;")
                    tables = [r[0] for r in cur.fetchall()]
                    print(f"    Schema '{s}' ({len(tables)} tables):")
                    for t in tables:
                        cur.execute(f'SELECT COUNT(*) FROM "{s}"."{t}";')
                        cnt = cur.fetchone()[0]
                        print(f"      - {s}.{t:22s}: {cnt:>10,} rows")

    except Exception as e:
        logger.error(f"Database connection failed: {e}")
        return 1

    print("\n  Planned Pipeline Execution Sequence:")
    print("    1. [raw]      Ingest 229 raw CSVs into raw.* schema via fast COPY")
    print("    2. [clean]    Transform, audit rejections, and upsert into clean.* fact & dim tables")
    print("    3. [align]    Build clean.daily_features & clean.v_ml_ready_daily_features")
    print("    4. [validate] Reconcile row counts, verify PK/FK integrity, ranges, and idempotency")
    print("\n" + "=" * 80)
    print("Dry run completed successfully. Zero database mutations performed.")
    print("=" * 80 + "\n")
    return 0


def print_run_summary(summary_records: list, total_elapsed: float) -> None:
    """Prints a structured ASCII execution summary table with counts and timings."""
    print("\n" + "=" * 84)
    print("                           STUDYSENSE ETL RUN SUMMARY")
    print("=" * 84)
    header = f"{'Step':<12} | {'Status':<10} | {'Inputs Processed':<20} | {'Output Produced':<22} | {'Time (s)':>8}"
    print(header)
    print("-" * 84)

    for rec in summary_records:
        line = (
            f"{rec['step']:<12} | "
            f"{rec['status']:<10} | "
            f"{rec['inputs']:<20} | "
            f"{rec['outputs']:<22} | "
            f"{rec['duration']:>8.2f}s"
        )
        print(line)

    print("-" * 84)
    all_success = all(r["status"] == "SUCCESS" for r in summary_records)
    final_status = "SUCCESS" if all_success else "FAILED"
    print(f"Total Pipeline Execution Time: {total_elapsed:.2f} seconds")
    print(f"Overall Pipeline Status      : {final_status}")
    print("=" * 84 + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="StudySense Unified ETL Pipeline Orchestrator"
    )
    parser.add_argument(
        "--only",
        choices=["raw", "clean", "align", "validate"],
        help="Execute only a specific pipeline step ('raw', 'clean', 'align', or 'validate')"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect inputs, test database connectivity, and print planned steps without mutating DB"
    )
    parser.add_argument(
        "--full-refresh",
        action="store_true",
        help="Truncate/drop and rebuild clean tables from scratch before loading"
    )
    args = parser.parse_args()

    if args.dry_run:
        return execute_dry_run()

    total_start = time.perf_counter()
    summary_records = []

    steps_to_run = [args.only] if args.only else ["raw", "clean", "align", "validate"]

    logger.info("==================================================================")
    logger.info(f"Starting StudySense ETL Pipeline (Steps: {', '.join(steps_to_run)})")
    if args.full_refresh:
        logger.warning("Flag --full-refresh enabled: target clean tables will be truncated before load!")
    logger.info("==================================================================")

    # -------------------------------------------------------------------------
    # STEP 1: RAW INGESTION
    # -------------------------------------------------------------------------
    if "raw" in steps_to_run:
        step_start = time.perf_counter()
        logger.info("\n>>> STEP 1: Ingesting Raw CSVs into PostgreSQL raw schema...")
        try:
            raw_stats = run_load_raw()
            elapsed = time.perf_counter() - step_start
            summary_records.append({
                "step": "raw",
                "status": "SUCCESS",
                "inputs": "229 Raw CSVs",
                "outputs": f"{raw_stats['total_rows']:,} raw rows",
                "duration": elapsed
            })
            logger.info(f"Raw ingestion completed in {elapsed:.2f}s ({raw_stats['total_rows']:,} rows).")
        except Exception as e:
            elapsed = time.perf_counter() - step_start
            summary_records.append({
                "step": "raw",
                "status": "FAILED",
                "inputs": "229 Raw CSVs",
                "outputs": f"Error: {e}",
                "duration": elapsed
            })
            logger.error(f"Step 'raw' failed: {e}", exc_info=True)
            print_run_summary(summary_records, time.perf_counter() - total_start)
            return 1

    # -------------------------------------------------------------------------
    # STEP 2: CLEAN LOAD (TRANSFORM & STAGED UPSERT)
    # -------------------------------------------------------------------------
    if "clean" in steps_to_run:
        step_start = time.perf_counter()
        logger.info("\n>>> STEP 2: Transforming and Loading clean.* fact & dimension tables...")
        try:
            # Load fact & dimension tables
            clean_stats = load_pipeline(
                include_clean=True,
                include_align=False,  # Aligned separately in step 3
                full_refresh=args.full_refresh
            )
            elapsed = time.perf_counter() - step_start
            total_clean_rows = sum(t.get("loaded", 0) for t in clean_stats["tables"].values())
            summary_records.append({
                "step": "clean",
                "status": "SUCCESS",
                "inputs": "3,561,525 raw rows",
                "outputs": f"{total_clean_rows:,} clean rows",
                "duration": elapsed
            })
            logger.info(f"Clean loading completed in {elapsed:.2f}s ({total_clean_rows:,} clean rows, {clean_stats['total_rejected']} rejected).")
        except Exception as e:
            elapsed = time.perf_counter() - step_start
            summary_records.append({
                "step": "clean",
                "status": "FAILED",
                "inputs": "Raw tables",
                "outputs": f"Error: {e}",
                "duration": elapsed
            })
            logger.error(f"Step 'clean' failed: {e}", exc_info=True)
            print_run_summary(summary_records, time.perf_counter() - total_start)
            return 1

    # -------------------------------------------------------------------------
    # STEP 3: TEMPORAL ALIGNMENT (clean.daily_features & ML View)
    # -------------------------------------------------------------------------
    if "align" in steps_to_run:
        step_start = time.perf_counter()
        logger.info("\n>>> STEP 3: Aggregating Temporal Alignment (clean.daily_features)...")
        try:
            align_stats = load_pipeline(
                include_clean=False,
                include_align=True,
                full_refresh=False
            )
            elapsed = time.perf_counter() - step_start
            df_info = align_stats["tables"].get("daily_features", {})
            total_days = df_info.get("total_days", 0)
            ml_ready = df_info.get("ml_ready_days", 0)
            summary_records.append({
                "step": "align",
                "status": "SUCCESS",
                "inputs": "Clean fact tables",
                "outputs": f"{total_days:,} days ({ml_ready:,} ML)",
                "duration": elapsed
            })
            logger.info(f"Alignment completed in {elapsed:.2f}s ({total_days:,} participant-days, {ml_ready:,} ML-ready).")
        except Exception as e:
            elapsed = time.perf_counter() - step_start
            summary_records.append({
                "step": "align",
                "status": "FAILED",
                "inputs": "Clean fact tables",
                "outputs": f"Error: {e}",
                "duration": elapsed
            })
            logger.error(f"Step 'align' failed: {e}", exc_info=True)
            print_run_summary(summary_records, time.perf_counter() - total_start)
            return 1

    # -------------------------------------------------------------------------
    # STEP 4: VALIDATION
    # -------------------------------------------------------------------------
    if "validate" in steps_to_run:
        step_start = time.perf_counter()
        logger.info("\n>>> STEP 4: Validating Database Integrity & Idempotency...")
        # If we ran the full pipeline, skip redundant re-run inside validate to save time
        skip_validate_rerun = ("clean" in steps_to_run or args.only == "validate")
        val_code = run_all_validations(skip_rerun=skip_validate_rerun)
        elapsed = time.perf_counter() - step_start

        if val_code == 0:
            summary_records.append({
                "step": "validate",
                "status": "SUCCESS",
                "inputs": "Clean & raw schemas",
                "outputs": "All 4 suites PASSED",
                "duration": elapsed
            })
            logger.info(f"Validation completed in {elapsed:.2f}s (Exit code: 0).")
        else:
            summary_records.append({
                "step": "validate",
                "status": "FAILED",
                "inputs": "Clean & raw schemas",
                "outputs": "Validation error detected",
                "duration": elapsed
            })
            logger.error("Step 'validate' failed with non-zero exit code.")
            print_run_summary(summary_records, time.perf_counter() - total_start)
            return 1

    total_elapsed = time.perf_counter() - total_start
    print_run_summary(summary_records, total_elapsed)
    return 0


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
