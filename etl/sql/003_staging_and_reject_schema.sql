-- ============================================================================
-- SQL Script: 003_staging_and_reject_schema.sql
-- Schemas: staging (unlogged fast load buffers) and clean.rejected_records (audit log)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS clean;

-- ----------------------------------------------------------------------------
-- Audit table: clean.rejected_records
-- Persists every dropped, superseded, or rejected row across all tables.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.rejected_records (
    id BIGSERIAL PRIMARY KEY,
    source_table VARCHAR(64) NOT NULL,
    participant_id SMALLINT NULL,
    record_identifier TEXT NOT NULL,
    rejection_reason TEXT NOT NULL,
    raw_payload JSONB NULL,
    rejected_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_rejected_records ON clean.rejected_records (source_table, participant_id, record_identifier);

-- ----------------------------------------------------------------------------
-- Staging Unlogged Tables (Fast bulk COPY buffers without WAL overhead)
-- ----------------------------------------------------------------------------

-- 1. staging.courses
CREATE UNLOGGED TABLE IF NOT EXISTS staging.courses (
    course_id VARCHAR(10),
    is_undergraduate BOOLEAN,
    start_date DATE,
    end_date DATE,
    semester SMALLINT,
    meets_monday BOOLEAN,
    meets_tuesday BOOLEAN,
    meets_wednesday BOOLEAN,
    meets_thursday BOOLEAN,
    meets_friday BOOLEAN,
    start_time TIME,
    end_time TIME
);

-- 2. staging.participants
CREATE UNLOGGED TABLE IF NOT EXISTS staging.participants (
    participant_id SMALLINT,
    university_id SMALLINT,
    course_id VARCHAR(10),
    has_wearable_data BOOLEAN
);

-- 3. staging.daily_questions
CREATE UNLOGGED TABLE IF NOT EXISTS staging.daily_questions (
    participant_id SMALLINT,
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    start_at TIMESTAMPTZ,
    stop_at TIMESTAMPTZ,
    original_sent_at TIMESTAMPTZ,
    is_resent BOOLEAN,
    timezone_offset_seconds INTEGER,
    delta_utc SMALLINT,
    stress_level SMALLINT,
    anxiety_level SMALLINT
);

-- 4. staging.stress
CREATE UNLOGGED TABLE IF NOT EXISTS staging.stress (
    participant_id SMALLINT,
    measurement_date DATE,
    updated_at TIMESTAMPTZ,
    stress_score SMALLINT,
    calculation_failed BOOLEAN
);

-- 5. staging.sleep
CREATE UNLOGGED TABLE IF NOT EXISTS staging.sleep (
    participant_id SMALLINT,
    timestamp TIMESTAMPTZ,
    overall_score SMALLINT,
    deep_sleep_minutes SMALLINT
);

-- 6. staging.oxygen
CREATE UNLOGGED TABLE IF NOT EXISTS staging.oxygen (
    participant_id SMALLINT,
    timestamp TIMESTAMPTZ,
    spo2_percentage NUMERIC(4, 1),
    is_probable_artifact BOOLEAN
);

-- 7. staging.steps
CREATE UNLOGGED TABLE IF NOT EXISTS staging.steps (
    participant_id SMALLINT,
    timestamp TIMESTAMPTZ,
    step_count INTEGER,
    is_high_intensity BOOLEAN
);

-- 8. staging.activity_level
CREATE UNLOGGED TABLE IF NOT EXISTS staging.activity_level (
    participant_id SMALLINT,
    timestamp TIMESTAMPTZ,
    activity_level VARCHAR(20)
);

-- 9. staging.hrv
CREATE UNLOGGED TABLE IF NOT EXISTS staging.hrv (
    participant_id SMALLINT,
    timestamp TIMESTAMPTZ,
    rmssd NUMERIC(8, 3),
    coverage NUMERIC(5, 3),
    low_frequency NUMERIC(10, 3),
    high_frequency NUMERIC(10, 3),
    is_valid_rmssd BOOLEAN,
    is_coverage_overcount BOOLEAN
);
