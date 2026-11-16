-- ============================================================================
-- Schema: clean
-- Cleaned, typed, and normalized layer for the SSAQS dataset.
-- Every table includes participant_id (where applicable) for ML train/test splitting.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS clean;

-- ----------------------------------------------------------------------------
-- 1. courses
-- Dimension table for academic courses and schedule metadata.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.courses (
    course_id VARCHAR(10) PRIMARY KEY,
    is_undergraduate BOOLEAN NOT NULL DEFAULT TRUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    semester SMALLINT NOT NULL,
    meets_monday BOOLEAN NOT NULL,
    meets_tuesday BOOLEAN NOT NULL,
    meets_wednesday BOOLEAN NOT NULL,
    meets_thursday BOOLEAN NOT NULL,
    meets_friday BOOLEAN NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT chk_courses_semester CHECK (semester > 0),
    CONSTRAINT chk_courses_dates CHECK (end_date >= start_date),
    CONSTRAINT chk_courses_times CHECK (end_time > start_time)
);

-- ----------------------------------------------------------------------------
-- 2. participants
-- Dimension table defining all enrolled study participants.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.participants (
    participant_id SMALLINT PRIMARY KEY,
    university_id SMALLINT NOT NULL,
    course_id VARCHAR(10) NOT NULL REFERENCES clean.courses(course_id),
    has_wearable_data BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_participants_id CHECK (participant_id BETWEEN 1 AND 100),
    CONSTRAINT chk_participants_university CHECK (university_id IN (1, 2))
);

-- ----------------------------------------------------------------------------
-- 3. daily_questions
-- Daily Ecological Momentary Assessment (EMA) questionnaire responses.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.daily_questions (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL,
    start_at TIMESTAMPTZ NOT NULL,
    stop_at TIMESTAMPTZ NOT NULL,
    original_sent_at TIMESTAMPTZ NULL,
    is_resent BOOLEAN NOT NULL DEFAULT FALSE,
    timezone_offset_seconds INTEGER NOT NULL,
    delta_utc SMALLINT NOT NULL,
    stress_level SMALLINT NOT NULL,
    anxiety_level SMALLINT NOT NULL,
    duration_seconds INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (stop_at - start_at))::INTEGER) STORED,
    CONSTRAINT pk_daily_questions PRIMARY KEY (participant_id, scheduled_at),
    CONSTRAINT chk_dq_stress CHECK (stress_level BETWEEN 0 AND 100),
    CONSTRAINT chk_dq_anxiety CHECK (anxiety_level BETWEEN 0 AND 100),
    CONSTRAINT chk_dq_timing CHECK (stop_at >= start_at)
);

-- ----------------------------------------------------------------------------
-- 4. activity_level
-- Minute-by-minute physical activity classifications from Fitbit Inspire 3.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.activity_level (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    timestamp TIMESTAMPTZ NOT NULL,
    activity_level VARCHAR(20) NOT NULL,
    CONSTRAINT pk_activity_level PRIMARY KEY (participant_id, timestamp),
    CONSTRAINT chk_activity_level_category CHECK (activity_level IN (
        'SEDENTARY', 'LIGHTLY_ACTIVE', 'MODERATELY_ACTIVE', 'VERY_ACTIVE'
    ))
);

-- ----------------------------------------------------------------------------
-- 5. steps
-- Minute-by-minute step counts from Fitbit Inspire 3.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.steps (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    timestamp TIMESTAMPTZ NOT NULL,
    step_count INTEGER NOT NULL,
    is_high_intensity BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_steps PRIMARY KEY (participant_id, timestamp),
    CONSTRAINT chk_steps_non_negative CHECK (step_count >= 0)
);

-- ----------------------------------------------------------------------------
-- 6. hrv
-- 5-minute rolling window Heart Rate Variability metrics from Fitbit Inspire 3.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.hrv (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    timestamp TIMESTAMPTZ NOT NULL,
    rmssd NUMERIC(8, 3) NOT NULL,
    coverage NUMERIC(5, 3) NOT NULL,
    low_frequency NUMERIC(10, 3) NOT NULL,
    high_frequency NUMERIC(10, 3) NOT NULL,
    is_valid_rmssd BOOLEAN NOT NULL DEFAULT TRUE,
    is_coverage_overcount BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_hrv PRIMARY KEY (participant_id, timestamp),
    CONSTRAINT chk_hrv_rmssd_non_negative CHECK (rmssd >= 0.0),
    CONSTRAINT chk_hrv_coverage_non_negative CHECK (coverage >= 0.0),
    CONSTRAINT chk_hrv_lf_non_negative CHECK (low_frequency >= 0.0),
    CONSTRAINT chk_hrv_hf_non_negative CHECK (high_frequency >= 0.0)
);

-- ----------------------------------------------------------------------------
-- 7. oxygen
-- Minute-level peripheral capillary oxygen saturation (SpO2) from Fitbit Inspire 3.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.oxygen (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    timestamp TIMESTAMPTZ NOT NULL,
    spo2_percentage NUMERIC(4, 1) NOT NULL,
    is_probable_artifact BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_oxygen PRIMARY KEY (participant_id, timestamp),
    CONSTRAINT chk_oxygen_bounds CHECK (spo2_percentage BETWEEN 0.0 AND 100.0)
);

-- ----------------------------------------------------------------------------
-- 8. sleep
-- Nightly sleep session summaries from Fitbit Inspire 3.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.sleep (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    timestamp TIMESTAMPTZ NOT NULL,
    overall_score SMALLINT NOT NULL,
    deep_sleep_minutes SMALLINT NOT NULL,
    CONSTRAINT pk_sleep PRIMARY KEY (participant_id, timestamp),
    CONSTRAINT chk_sleep_overall_score CHECK (overall_score BETWEEN 0 AND 100),
    CONSTRAINT chk_sleep_deep_sleep_minutes CHECK (deep_sleep_minutes >= 0)
);

-- ----------------------------------------------------------------------------
-- 9. stress
-- Daily calculated Fitbit stress management scores.
-- Primary key: (participant_id, measurement_date) ensuring one score per student day.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clean.stress (
    participant_id SMALLINT NOT NULL REFERENCES clean.participants(participant_id),
    measurement_date DATE NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    stress_score SMALLINT NULL,
    calculation_failed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_stress PRIMARY KEY (participant_id, measurement_date),
    CONSTRAINT chk_stress_score_bounds CHECK (stress_score IS NULL OR (stress_score BETWEEN 0 AND 100)),
    CONSTRAINT chk_stress_failed_logic CHECK (calculation_failed = TRUE OR stress_score IS NOT NULL)
);

-- ----------------------------------------------------------------------------
-- Indexes for ML team query patterns (time-range filtering and participant slices)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_daily_questions_participant_time ON clean.daily_questions (participant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_activity_level_participant_time ON clean.activity_level (participant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_steps_participant_time ON clean.steps (participant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_hrv_participant_time ON clean.hrv (participant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_oxygen_participant_time ON clean.oxygen (participant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_sleep_participant_time ON clean.sleep (participant_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_stress_participant_date ON clean.stress (participant_id, measurement_date);
