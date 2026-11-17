# StudySense participant-aware ML

Run from the repository root with Python 3.12. Install `ml/requirements-lock.txt`
to reproduce a completed run, or `ml/requirements.txt` to set up initially:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r ml/requirements-lock.txt
.venv/Scripts/python.exe -m ml.experiment prepare
.venv/Scripts/python.exe -m ml.experiment audit
.venv/Scripts/python.exe -m ml.experiment split
.venv/Scripts/python.exe -m ml.experiment train
.venv/Scripts/python.exe -m pytest ml/tests -q
```

`python -m ml.experiment all` runs all stages. No Supabase access is needed:
the exporter reads `etl/data/raw/SSAQS dataset/` and reuses ETL transforms.
Reports are under `ml/outputs/` and `ML_EVALUATION_REPORT.md`.
Participant-level data, splits, predictions and serialized artifacts are local,
gitignored outputs. Share them through an appropriate team artifact channel.

The fixed test participants are untouched during model selection. Rerunning is
for reproducibility, not a license to tune against test results. The selected
artifact remains fitted only on development participants. Dataset changes fail
against an existing frozen split; start a separately versioned experiment.

```python
from ml.inference import predict_profile
result = predict_profile(features_dict)
```

Use `feature_contract.json` for exact names/units. Pass only wearable feature
fields; omitted fields or `None` represent missing data. Invalid values raise
`ValueError`. A caller must clarify/defer on errors or uncertain outputs.
Missing evidence permits `predicted_profile=None`. Model probabilities are
uncalibrated. A profile is a research category, not a diagnosis.

This is retrospective completed UTC-day classification. All daily features
must be available before calling the model; do not replay full-day summaries
as if they existed at an earlier survey or intervention time.

Only load trusted joblib files. The complete pipeline and uncertainty policy
are exported to `models/studysense_profile_classifier.joblib` and a versioned
copy. Metadata and dependency versions are saved beside experiment reports.
