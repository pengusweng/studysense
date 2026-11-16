-- Schema: raw
CREATE SCHEMA IF NOT EXISTS raw;

-- 1. Course Details (Metadata)
CREATE TABLE IF NOT EXISTS raw.course_details (
    "idcourse" TEXT,
    "undergraduate" TEXT,
    "startDate" TEXT,
    "endDate" TEXT,
    "semester" TEXT,
    "Monday" TEXT,
    "Tuesday" TEXT,
    "Wednesday" TEXT,
    "Thursday" TEXT,
    "Friday" TEXT,
    "startTime" TEXT,
    "endTime" TEXT
);

-- 2. Users Courses (Metadata / Mapping)
CREATE TABLE IF NOT EXISTS raw.users_courses (
    "participant_id" TEXT,
    "userid" TEXT,
    "university" TEXT,
    "course" TEXT
);

-- 3. Daily Questions (Questionnaire Self-Reports)
CREATE TABLE IF NOT EXISTS raw.daily_questions (
    "participant_id" TEXT,
    "timeStampScheduled" TEXT,
    "timeStampSent" TEXT,
    "timeStampStart" TEXT,
    "timeStampStop" TEXT,
    "originalTimeStampSent" TEXT,
    "timeZoneOffset" TEXT,
    "deltaUTC" TEXT,
    "stress" TEXT,
    "anxiety" TEXT
);

-- 4. Activity Level (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.activity_level (
    "participant_id" TEXT,
    "timestamp" TEXT,
    "level" TEXT
);

-- 5. HRV (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.hrv (
    "participant_id" TEXT,
    "timestamp" TEXT,
    "rmssd" TEXT,
    "coverage" TEXT,
    "low_frequency" TEXT,
    "high_frequency" TEXT
);

-- 6. Oxygen SpO2 (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.oxygen (
    "participant_id" TEXT,
    "timestamp" TEXT,
    "value" TEXT
);

-- 7. Sleep (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.sleep (
    "participant_id" TEXT,
    "timestamp" TEXT,
    "overall_score" TEXT,
    "deep_sleep_in_minutes" TEXT
);

-- 8. Steps (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.steps (
    "participant_id" TEXT,
    "timestamp" TEXT,
    "steps" TEXT
);

-- 9. Stress (Fitbit Sensor)
CREATE TABLE IF NOT EXISTS raw.stress (
    "participant_id" TEXT,
    "DATE" TEXT,
    "UPDATED_AT" TEXT,
    "STRESS_SCORE" TEXT,
    "CALCULATION_FAILED" TEXT
);
