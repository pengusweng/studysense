# StudySense API

A FastAPI service for the web app. It does four things:

- Replays recorded SSAQS participant-days through the trained profile model.
- Lists which days can be replayed.
- Runs the rule-based response.
- Logs check-in and feedback events.

It does not train anything, and nothing in the event log feeds back into the model.

## How it connects to the ML pipeline

The API calls the pipeline's own code instead of re-implementing it:

| API part | Pipeline code it uses |
|---|---|
| Model inputs and validation | `ml.contracts.FEATURES`, `validate_features` |
| Prediction | `ml.inference.load_artifact`, `predict_profile` |
| Feature rows | `ml/data/daily_features.csv`, written by `ml.data.export_daily` (which reuses `etl.src.transform`) |

The model file and the feature CSV are both outputs of `python -m ml.experiment all`. Both are gitignored, so you rebuild them locally.

To serve a retrained model, restart the API. `/health` shows which `model_version` it loaded. If a model's feature or class contract doesn't match `ml/contracts.py`, the API refuses to start.

## Run

All commands run from the repository root.

```powershell
python -m venv .venv
.\.venv\Scripts\activate
pip install -r api/requirements.txt

python -m ml.experiment all          # builds ml/data/ and models/*.joblib
uvicorn api.main:app --reload        # http://localhost:8000, interactive docs at /docs

python -m pytest api/tests -q
```

## Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{status, model_version, contract_version, days}` |
| GET | `/demo/days` | `{ "<participant>": ["YYYY-MM-DD", ...] }`. Lists days that have at least one of the 17 model inputs |
| GET | `/predictions/{participant}/{date}` | The `predict_profile` output (see `ml/outputs/prediction_contract.json`). Returns 404 when the day can't be replayed |
| POST | `/response` | Body `{estimate, check_in, correction?, history}`. Returns `{kind: "silent", reason}`, `{kind: "offer", suggestion, basis}` or `{kind: "support"}` |
| POST | `/events` | Body `{visit_id, kind: "check_in" \| "feedback", participant, date, check_in? \| suggestion, action, correction?}`. Returns 204 |

Unknown or inconsistent values return 422. The enums match the web app's TypeScript types.

## Configuration

Set these as environment variables. Defaults are relative to the repo.

| Variable | Default |
|---|---|
| `MODEL_PATH` | `models/studysense_profile_classifier.joblib` |
| `FEATURES_CSV` | `ml/data/daily_features.csv` |
| `EVENTS_DB` | `api/data/events.sqlite3` |
| `CORS_ORIGINS` | `http://localhost:3000` (comma-separated). Only needed when a browser calls the API directly: the web app normally goes through the Next proxy at `/api` |

## Notes

- Questionnaire scores (`reported_*`) are training targets. `FeatureStore` never reads them, so no endpoint can return them.
- Under the current policy (`confidence_threshold: 1.01`), every prediction is `uncertain`. That is expected, and the response rules never act on an uncertain estimate.
- Events are sent only when the student agreed to check-ins. The log is a local SQLite file for analysis, not secure production storage.
- The model file is loaded only from `MODEL_PATH`, never from a request. Only load joblib files you trust.

To read the event log:

```powershell
python -c "from api.events import EventLog; from pathlib import Path; print(*EventLog(Path('api/data/events.sqlite3')).all(), sep='\n')"
```
