-- ============================================================================
-- SQL Script: 002_daily_alignment.sql
-- Clean Layer: Temporal Alignment Table (Unit of Analysis: participant-day)
-- Aggregates multi-modal sensor streams and joins daily questionnaire responses.
-- ============================================================================

DROP TABLE IF EXISTS clean.daily_features CASCADE;

CREATE TABLE clean.daily_features AS
WITH 
  dates_participants AS (
    SELECT DISTINCT participant_id, timestamp::date AS date FROM clean.steps
    UNION
    SELECT DISTINCT participant_id, timestamp::date AS date FROM clean.activity_level
    UNION
    SELECT DISTINCT participant_id, timestamp::date AS date FROM clean.oxygen
    UNION
    SELECT DISTINCT participant_id, timestamp::date AS date FROM clean.hrv
    UNION
    SELECT DISTINCT participant_id, timestamp::date AS date FROM clean.sleep
    UNION
    SELECT DISTINCT participant_id, measurement_date AS date FROM clean.stress
    UNION
    SELECT DISTINCT participant_id, scheduled_at::date AS date FROM clean.daily_questions
  ),
  agg_steps AS (
    SELECT 
      participant_id, 
      timestamp::date AS date,
      SUM(step_count)::INTEGER AS total_steps,
      ROUND(AVG(step_count), 2) AS mean_steps_per_min,
      MAX(step_count)::INTEGER AS max_steps_per_min,
      COUNT(*) FILTER (WHERE step_count > 0)::INTEGER AS active_minutes
    FROM clean.steps
    GROUP BY participant_id, timestamp::date
  ),
  agg_activity AS (
    SELECT 
      participant_id, 
      timestamp::date AS date,
      COUNT(*) FILTER (WHERE activity_level = 'SEDENTARY')::INTEGER AS sedentary_minutes,
      COUNT(*) FILTER (WHERE activity_level = 'LIGHTLY_ACTIVE')::INTEGER AS lightly_active_minutes,
      COUNT(*) FILTER (WHERE activity_level = 'MODERATELY_ACTIVE')::INTEGER AS moderately_active_minutes,
      COUNT(*) FILTER (WHERE activity_level = 'VERY_ACTIVE')::INTEGER AS very_active_minutes
    FROM clean.activity_level
    GROUP BY participant_id, timestamp::date
  ),
  agg_hrv AS (
    SELECT 
      participant_id, 
      timestamp::date AS date,
      ROUND(AVG(rmssd) FILTER (WHERE is_valid_rmssd), 3) AS mean_rmssd,
      MIN(rmssd) FILTER (WHERE is_valid_rmssd) AS min_rmssd,
      MAX(rmssd) FILTER (WHERE is_valid_rmssd) AS max_rmssd,
      ROUND(AVG(coverage), 3) AS mean_coverage,
      ROUND(AVG(low_frequency), 3) AS mean_low_frequency,
      ROUND(AVG(high_frequency), 3) AS mean_high_frequency,
      COUNT(*)::INTEGER AS hrv_reading_count
    FROM clean.hrv
    GROUP BY participant_id, timestamp::date
  ),
  agg_oxygen AS (
    SELECT 
      participant_id, 
      timestamp::date AS date,
      ROUND(AVG(spo2_percentage), 1) AS mean_spo2,
      MIN(spo2_percentage) AS min_spo2,
      MAX(spo2_percentage) AS max_spo2,
      COUNT(*)::INTEGER AS spo2_reading_count,
      COUNT(*) FILTER (WHERE is_probable_artifact)::INTEGER AS artifact_spo2_count
    FROM clean.oxygen
    GROUP BY participant_id, timestamp::date
  ),
  agg_sleep AS (
    SELECT 
      participant_id, 
      timestamp::date AS date,
      ROUND(AVG(overall_score), 1) AS sleep_overall_score,
      SUM(deep_sleep_minutes)::INTEGER AS deep_sleep_minutes
    FROM clean.sleep
    GROUP BY participant_id, timestamp::date
  ),
  agg_stress AS (
    SELECT 
      participant_id, 
      measurement_date AS date,
      stress_score::SMALLINT AS fitbit_stress_score,
      calculation_failed AS fitbit_stress_calc_failed
    FROM clean.stress
  ),
  agg_questions AS (
    SELECT 
      participant_id, 
      scheduled_at::date AS date,
      ROUND(AVG(stress_level), 2) AS reported_stress_mean,
      MIN(stress_level)::SMALLINT AS reported_stress_min,
      MAX(stress_level)::SMALLINT AS reported_stress_max,
      ROUND(AVG(anxiety_level), 2) AS reported_anxiety_mean,
      MIN(anxiety_level)::SMALLINT AS reported_anxiety_min,
      MAX(anxiety_level)::SMALLINT AS reported_anxiety_max,
      COUNT(*)::SMALLINT AS survey_response_count
    FROM clean.daily_questions
    GROUP BY participant_id, scheduled_at::date
  )
SELECT 
  dp.participant_id,
  dp.date,
  st.total_steps,
  st.mean_steps_per_min,
  st.max_steps_per_min,
  st.active_minutes,
  act.sedentary_minutes,
  act.lightly_active_minutes,
  act.moderately_active_minutes,
  act.very_active_minutes,
  hrv.mean_rmssd,
  hrv.min_rmssd,
  hrv.max_rmssd,
  hrv.mean_coverage,
  hrv.mean_low_frequency,
  hrv.mean_high_frequency,
  hrv.hrv_reading_count,
  oxy.mean_spo2,
  oxy.min_spo2,
  oxy.max_spo2,
  oxy.spo2_reading_count,
  oxy.artifact_spo2_count,
  slp.sleep_overall_score,
  slp.deep_sleep_minutes,
  str.fitbit_stress_score,
  str.fitbit_stress_calc_failed,
  q.reported_stress_mean,
  q.reported_stress_min,
  q.reported_stress_max,
  q.reported_anxiety_mean,
  q.reported_anxiety_min,
  q.reported_anxiety_max,
  COALESCE(q.survey_response_count, 0::SMALLINT) AS survey_response_count,
  -- Flags
  (st.total_steps IS NOT NULL OR act.sedentary_minutes IS NOT NULL OR hrv.mean_rmssd IS NOT NULL OR oxy.mean_spo2 IS NOT NULL OR slp.sleep_overall_score IS NOT NULL OR str.fitbit_stress_calc_failed IS NOT NULL) AS has_sensor_data,
  (q.survey_response_count IS NOT NULL AND q.survey_response_count > 0) AS has_questionnaire_data,
  ((st.total_steps IS NOT NULL OR act.sedentary_minutes IS NOT NULL OR hrv.mean_rmssd IS NOT NULL OR oxy.mean_spo2 IS NOT NULL OR slp.sleep_overall_score IS NOT NULL OR str.fitbit_stress_calc_failed IS NOT NULL) AND (q.survey_response_count IS NOT NULL AND q.survey_response_count > 0)) AS has_both_modalities
FROM dates_participants dp
LEFT JOIN agg_steps st ON dp.participant_id = st.participant_id AND dp.date = st.date
LEFT JOIN agg_activity act ON dp.participant_id = act.participant_id AND dp.date = act.date
LEFT JOIN agg_hrv hrv ON dp.participant_id = hrv.participant_id AND dp.date = hrv.date
LEFT JOIN agg_oxygen oxy ON dp.participant_id = oxy.participant_id AND dp.date = oxy.date
LEFT JOIN agg_sleep slp ON dp.participant_id = slp.participant_id AND dp.date = slp.date
LEFT JOIN agg_stress str ON dp.participant_id = str.participant_id AND dp.date = str.date
LEFT JOIN agg_questions q ON dp.participant_id = q.participant_id AND dp.date = q.date;

ALTER TABLE clean.daily_features ADD CONSTRAINT pk_daily_features PRIMARY KEY (participant_id, date);
ALTER TABLE clean.daily_features ADD CONSTRAINT fk_daily_features_participant FOREIGN KEY (participant_id) REFERENCES clean.participants(participant_id);
CREATE INDEX IF NOT EXISTS idx_daily_features_participant_date ON clean.daily_features (participant_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_features_both_modalities ON clean.daily_features (has_both_modalities);
