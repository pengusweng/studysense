# StudySense RQ1 ML Evaluation Report

RQ1: Can wearable features predict four daily stress-anxiety profiles?

## Scope and reproducibility

This is retrospective classification of completed UTC days in SSAQS, not prospective forecasting, real-time intervention, clinical diagnosis, or causal inference.
Source: 229 CSVs; 3618 participant-days; 2291 paired days; 2273 eligible modeling days from 32 participants. 18 paired days excluded for no RQ1 inputs.
Raw SHA256 hashes, export hashes and aggregation details are in the local ml/data/manifest.json. No database credentials are required. SQL parity was checked by code inspection, not against a live database. The Python HRV helper filters all HRV rows by RMSSD validity; this exporter instead matches SQL by filtering only RMSSD summaries. UTC dates preserve the existing ETL convention; local-calendar alignment is a sensitivity analysis still to do.

## Target and class audit

Daily questionnaire means define LSLA (<50,<50), LSHA (<50,>=50), HSLA (>=50,<50), HSHA (>=50,>=50). Exactly 50 is High. These operational thresholds are not clinical cutoffs.

| Class | Rows | Percent | Participants |
|---|---:|---:|---:|
| LSLA | 1396 | 61.42 | 31 |
| LSHA | 260 | 11.44 | 26 |
| HSLA | 175 | 7.70 | 23 |
| HSHA | 442 | 19.45 | 29 |

Boundary audit: 81 days with either mean exactly 50; 414 within ±5; 664 within ±10.

## Participant-aware protocol

Seed 42; fixed GroupShuffleSplit test fraction 25% of participants. Development: 1717 days, 24 participants; test: 556 days, 8 participants. Zero participant overlap. Three StratifiedGroupKFold development folds; identical folds for every candidate.
All median imputation (including missingness indicators) and standardization are fitted inside each training fold. No participant IDs, dates, questionnaire summaries, survey counts, SpO2 or proprietary Fitbit stress scores are predictors. No rolling/forward-fill features or observations from another day are used. Full-day features are only valid after that day closes; the split evaluates unseen participants in the same study period, not future-period generalization.
LR tests C={0.01,0.1,1,10}, separately standard and balanced weights. RF uses 200 trees, max_depth={6,None}, min_samples_leaf={2,5}, separately standard and balanced weights. Macro-F1 over the fixed four classes is the selection metric. Scores for absent classes use zero_division=0. The winner is frozen from development CV before test metrics are computed; test results must not be used to retune.

## Results on unseen test participants

| Model | CV macro-F1 | Test macro-F1 | Weighted-F1 | Accuracy |
|---|---:|---:|---:|---:|
| majority | 0.1894 | 0.1915 | 0.4752 | 0.6205 |
| logistic_standard | 0.2096 | 0.1974 | 0.4735 | 0.6079 |
| logistic_balanced | 0.2086 | 0.2509 | 0.3490 | 0.3022 |
| forest_standard | 0.2130 | 0.2184 | 0.4892 | 0.6061 |
| forest_balanced | 0.2499 | 0.2644 | 0.4700 | 0.4820 |

Selected by development CV: **forest_balanced**. Selected test Macro-F1 participant-bootstrap percentile 95% interval: [0.2191, 0.2993] (1,000 resamples of test participants; few clusters limit precision).

| Model | Class | Precision | Recall | F1 | Support |
|---|---|---:|---:|---:|---:|
| majority | LSLA | 0.6205 | 1.0000 | 0.7658 | 345 |
| majority | LSHA | 0.0000 | 0.0000 | 0.0000 | 61 |
| majority | HSLA | 0.0000 | 0.0000 | 0.0000 | 55 |
| majority | HSHA | 0.0000 | 0.0000 | 0.0000 | 95 |
| logistic_standard | LSLA | 0.6195 | 0.9768 | 0.7582 | 345 |
| logistic_standard | LSHA | 0.0000 | 0.0000 | 0.0000 | 61 |
| logistic_standard | HSLA | 0.1111 | 0.0182 | 0.0312 | 55 |
| logistic_standard | HSHA | 0.0000 | 0.0000 | 0.0000 | 95 |
| logistic_balanced | LSLA | 0.7552 | 0.3130 | 0.4426 | 345 |
| logistic_balanced | LSHA | 0.1282 | 0.2459 | 0.1685 | 61 |
| logistic_balanced | HSLA | 0.1095 | 0.2727 | 0.1562 | 55 |
| logistic_balanced | HSHA | 0.1887 | 0.3158 | 0.2362 | 95 |
| forest_standard | LSLA | 0.6250 | 0.9565 | 0.7560 | 345 |
| forest_standard | LSHA | 0.0000 | 0.0000 | 0.0000 | 61 |
| forest_standard | HSLA | 0.0000 | 0.0000 | 0.0000 | 55 |
| forest_standard | HSHA | 0.2917 | 0.0737 | 0.1176 | 95 |
| forest_balanced | LSLA | 0.6521 | 0.6899 | 0.6704 | 345 |
| forest_balanced | LSHA | 0.1143 | 0.0656 | 0.0833 | 61 |
| forest_balanced | HSLA | 0.1064 | 0.0909 | 0.0980 | 55 |
| forest_balanced | HSHA | 0.1927 | 0.2211 | 0.2059 | 95 |

Confusion matrices use rows=true and columns=predicted in LSLA, LSHA, HSLA, HSHA order. Each model has CSV, 300-dpi PNG and vector PDF outputs in ml/outputs; structured matrices are in metrics.json.

## Error analysis

### majority

Most common confusions: [{"true": "HSHA", "predicted": "LSLA", "count": 95}, {"true": "LSHA", "predicted": "LSLA", "count": 61}, {"true": "HSLA", "predicted": "LSLA", "count": 55}]
Boundary (±5 either mean) error rate: 0.7011494252873564; nonboundary: 0.31982942430703626. Boundary n=87.

### logistic_standard

Most common confusions: [{"true": "HSHA", "predicted": "LSLA", "count": 93}, {"true": "LSHA", "predicted": "LSLA", "count": 60}, {"true": "HSLA", "predicted": "LSLA", "count": 54}, {"true": "LSLA", "predicted": "HSLA", "count": 6}, {"true": "LSLA", "predicted": "LSHA", "count": 2}]
Boundary (±5 either mean) error rate: 0.7126436781609196; nonboundary: 0.3326226012793177. Boundary n=87.

### logistic_balanced

Most common confusions: [{"true": "LSLA", "predicted": "HSHA", "count": 94}, {"true": "LSLA", "predicted": "HSLA", "count": 80}, {"true": "LSLA", "predicted": "LSHA", "count": 63}, {"true": "HSHA", "predicted": "LSHA", "count": 26}, {"true": "HSHA", "predicted": "HSLA", "count": 23}]
Boundary (±5 either mean) error rate: 0.7701149425287356; nonboundary: 0.6844349680170576. Boundary n=87.

### forest_standard

Most common confusions: [{"true": "HSHA", "predicted": "LSLA", "count": 87}, {"true": "LSHA", "predicted": "LSLA", "count": 58}, {"true": "HSLA", "predicted": "LSLA", "count": 53}, {"true": "LSLA", "predicted": "HSHA", "count": 12}, {"true": "LSHA", "predicted": "HSHA", "count": 3}]
Boundary (±5 either mean) error rate: 0.6896551724137931; nonboundary: 0.3390191897654584. Boundary n=87.

### forest_balanced

Most common confusions: [{"true": "LSLA", "predicted": "HSHA", "count": 62}, {"true": "HSHA", "predicted": "LSLA", "count": 55}, {"true": "LSHA", "predicted": "LSLA", "count": 37}, {"true": "HSLA", "predicted": "LSLA", "count": 35}, {"true": "LSLA", "predicted": "HSLA", "count": 25}]
Boundary (±5 either mean) error rate: 0.7126436781609196; nonboundary: 0.48187633262260127. Boundary n=87.

Participant-specific accuracy/Macro-F1 are in error_analysis.json. Minority-class and participant heterogeneity must be considered alongside aggregate accuracy. Per-participant macro-F1 includes all four classes even if a participant does not exhibit them.

## Interpretability

Selected feature coefficients/importances, including missingness indicators, are in selected_feature_importance.csv. LR coefficients are for standardized inputs; RF impurity importances are descriptive, correlated-feature-sensitive and not causal. Dummy importance values carry no interpretation.

Top features by mean absolute coefficient or impurity importance:

- mean_low_frequency: 0.075238
- sedentary_minutes: 0.070387
- mean_high_frequency: 0.067497
- mean_steps_per_min: 0.067082
- lightly_active_minutes: 0.066740
- mean_rmssd: 0.062763
- active_minutes: 0.062197
- max_steps_per_min: 0.061846
- min_rmssd: 0.061266
- max_rmssd: 0.061060

## Uncertainty and fallback

Policy: `{"confidence_threshold": 1.01, "margin_threshold": 1.0, "max_missing_fraction": 0.5, "selection": "Development OOF target accuracy>=0.70 and coverage>=10% (minimum 30); else abstain all", "probabilities_calibrated": false, "development_estimate_optimistic": "Hyperparameters and thresholds share development CV; final test is independent."}`
Final-test fallback results: `{"test_coverage": 0.0, "accepted_n": 0, "accepted_accuracy": null, "missing_evidence_n": 161}`
Thresholds are selected using development OOF predictions and a minimum acceptance accuracy of 70%, with minimum coverage 10% and 30 accepted cases. If no policy meets these criteria, all predictions defer. This criterion is an engineering choice, not demonstrated safety. OOF hyperparameters were selected using the same development folds, so these development estimates are optimistic; final-test reporting remains independent. Probabilities are uncalibrated and must not be interpreted as clinical confidence. Missing more than half of the 17 inputs yields missing_evidence and null prediction/probabilities. Other uncertain rows retain their candidate profile while recommending clarify_or_defer.

## Inference handoff

```python
from ml.inference import predict_profile
result = predict_profile(wearable_features_dict)
```

Feature and output schemas are in feature_contract.json and prediction_contract.json. Inputs must use the exact 17 allowlisted keys; omitted values/JSON null represent missing data. Unknown fields, booleans, strings, nonfinite numbers and out-of-range values raise ValueError; callers must defer on invalid input. Outputs include predicted_profile, probabilities, confidence_score, is_uncertain, evidence_status, fallback_recommendation, missing_features, model_version and contract_version. Never load untrusted joblib files.

## RQ1 interpretation and limitations

The development-selected model achieves test Macro-F1 0.2644, versus majority baseline 0.1915. This exceeds the majority baseline in this fixed split; it does not establish reliable recognition of all four profiles. Assess per-class recalls above before making that claim.
One small cohort and one held-out participant split limit generalization. No external validation, prospective evaluation, clinical validation, or probability calibration was performed. Daily mean thresholding can hide within-day variation. Rare profiles and participant-level label concentration can destabilize evaluation. Test participants were not selected to guarantee class balance. More repeated/nested grouped evaluation and calibration on independent participants would strengthen evidence; do not use this test set to optimize subsequent variants.

## Reproduction

```powershell
.venv/Scripts/python.exe -m ml.experiment all
.venv/Scripts/python.exe -m pytest ml/tests -q
```

Install ml/requirements-lock.txt for the exact environment. Frozen row indices and development folds are under local ml/outputs/splits; input hashes prevent silently reusing splits with changed data. Participant-level exports/predictions and model binaries are gitignored. The selected artifact is fitted only on development participants, preserving the independent test set.
Environment: `{"python": "3.12.16", "numpy": "2.5.5", "pandas": "2.3.3", "scikit_learn": "1.7.2", "joblib": "1.6.0", "matplotlib": "3.11.2"}`

## Verification

Automated test results are recorded separately in ml/outputs/test-results.txt after the run.
