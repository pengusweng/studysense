# Temporal Alignment & Feature Aggregation Strategy

This document details the temporal alignment strategy for combining multi-modal wearable sensor streams and daily questionnaire self-reports in the StudySense pipeline.

---

## 1. Decision: Unit of Analysis is `participant-day`

The chosen unit of analysis is **`participant-day`**, uniquely identified by the composite key `(participant_id, date)`.

### Rationale:
1. **Target Sampling Frequency**: The primary ground-truth labels for this project are student subjective stress and anxiety self-reports (`daily_questions.csv`). These are administered via Ecological Momentary Assessment (EMA) prompts scheduled twice per day (morning and evening), capturing daily experiential states.
2. **Sensor Sampling Rate Heterogeneity**:
   - `activity_level`, `steps`, and `oxygen`: Recorded at **1-minute intervals**.
   - `hrv`: Computed in **5-minute rolling epochs**.
   - `sleep`: Summarized as **1 record per sleep session / night**.
   - `stress`: Computed as **1 score per calendar day**.
   Aligning at a minute-by-minute level would require extreme sparse matrix representations with over 90% missing values for sleep, daily stress, and questionnaires, forcing artificial forward-filling or imputation.
3. **ML Readiness for Downstream Modeling**: The research goal is to predict university student stress and anxiety levels from wearable physiological data. Aggregating sensor streams into daily behavioral, autonomic, and physiological summaries directly matches the granularity needed to predict daily psychological distress.
4. **Physiological Circadian Dynamics**: Daily metrics capture diurnal patterns (such as total daytime activity, nocturnal autonomic recovery via RMSSD, sleep architecture, and SpO2 stability) without noise from short-term transient artifacts.

---

## 2. Sensor Aggregations per Modality

For each `(participant_id, date)` pair, raw sensor streams are aggregated using robust descriptive statistics:

### A. Physical Activity & Cadence (`raw.steps` & `raw.activity_level`)
- **`total_steps`**: Sum of steps accumulated over the 24-hour day.
- **`mean_steps_per_min`**: Average step cadence across active minutes.
- **`max_steps_per_min`**: Peak 1-minute step cadence.
- **`active_minutes`**: Count of minutes with `step_count > 0`.
- **`sedentary_minutes`**: Total minutes logged with `activity_level = 'SEDENTARY'`.
- **`lightly_active_minutes`**: Total minutes logged with `activity_level = 'LIGHTLY_ACTIVE'`.
- **`moderately_active_minutes`**: Total minutes logged with `activity_level = 'MODERATELY_ACTIVE'`.
- **`very_active_minutes`**: Total minutes logged with `activity_level = 'VERY_ACTIVE'`.

### B. Autonomic Nervous System & Recovery (`raw.hrv`)
- **`mean_rmssd`**: Mean Root Mean Square of Successive Differences across valid epochs (`rmssd > 0.0`).
- **`min_rmssd`** & **`max_rmssd`**: Range of heart rate variability across the day.
- **`mean_coverage`**: Average valid beat coverage ratio across 5-minute windows.
- **`mean_low_frequency`** & **`mean_high_frequency`**: Sympathetic / parasympathetic spectral power indicators.
- **`hrv_reading_count`**: Total valid 5-minute HRV epochs recorded.

### C. Nocturnal & Peripheral Oxygenation (`raw.oxygen`)
- **`mean_spo2`**: Average blood oxygen percentage across all recorded minutes.
- **`min_spo2`** & **`max_spo2`**: Extremes of blood oxygenation.
- **`spo2_reading_count`**: Total minutes with SpO2 readings.
- **`artifact_spo2_count`**: Count of minutes where `spo2 < 70.0%` (PPG sensor optical disconnects/motion artifacts).

### D. Sleep Architecture (`raw.sleep`)
- **`sleep_overall_score`**: Fitbit proprietary sleep efficiency score (40–94).
- **`deep_sleep_minutes`**: Total deep (slow-wave) sleep duration in minutes.

### E. Device Daily Stress Score (`raw.stress`)
- **`fitbit_stress_score`**: Fitbit calculated daily stress management score (0–96). Set to `NULL` when `calculation_failed = True`.
- **`fitbit_stress_calc_failed`**: Boolean flag indicating whether the device had insufficient wear time to calculate the score.

---

## 3. Ground-Truth Questionnaire Alignment

From `raw.daily_questions`, EMA survey self-reports are aligned to the calendar date of the response:
- **`reported_stress_mean`**: Average self-reported stress score (0–100) for that day.
- **`reported_stress_min`** & **`reported_stress_max`**: Diurnal range of self-reported stress.
- **`reported_anxiety_mean`**: Average self-reported anxiety score (0–100) for that day.
- **`reported_anxiety_min`** & **`reported_anxiety_max`**: Diurnal range of self-reported anxiety.
- **`survey_response_count`**: Number of questionnaire responses submitted on that day (typically 1 or 2).

---

## 4. Presence and Modality Quality Flags

In accordance with the project rule (*"Do NOT impute missing values in the ETL. Keep NULL and add a flag column where useful"*), the dataset does not impute missing days or sensor gaps. Instead, three explicit boolean flags are provided:

| Flag Column | Type | Definition | Primary Use Case |
|---|---|---|---|
| **`has_sensor_data`** | `BOOLEAN` | `True` if **any** sensor modality recorded data on this day; `False` if no sensor records exist. | Identifies non-wear days or sensor-less participants (IDs 3, 12, 14). |
| **`has_questionnaire_data`** | `BOOLEAN` | `True` if `survey_response_count > 0` on this day; `False` if no surveys were answered. | Filters days with ground-truth self-report targets. |
| **`has_both_modalities`** | `BOOLEAN` | `True` when both `has_sensor_data` AND `has_questionnaire_data` are `True`. | **Supervised ML Subsetting**: Instantly filters the dataset to complete sensor-to-survey pairs for model training and cross-validation without data leakage. |

---

## 5. Non-Wearable Participant Handling

As identified in [profile.md](file:///C:/dev/studysense-empathic-system/etl/docs/profile.md), participants **3, 12, and 14** completed daily questionnaires but had zero wearable sensor recordings.
- In this aligned schema, their records appear with `has_sensor_data = False` and `has_questionnaire_data = True`.
- Their questionnaire responses are retained completely for survey-only analysis or baseline distribution modeling, while being automatically excluded from sensor-based supervised training via `WHERE has_both_modalities = TRUE`.
