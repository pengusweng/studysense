# StudySense API

A FastAPI service for the web app. It does four things:

- Replays recorded SSAQS participant-days through the trained profile model.
- Lists which days can be replayed.
- Runs the rule-based response.
- Does not collect student check-in or feedback events while privacy review is pending.

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

### Privacy default

The `/events` API is disabled by default and returns HTTP 403 for valid requests.
The web client does not transmit new check-in/feedback events. This is an interim
no-collection policy pending documented consent, access, retention and deletion decisions.
Previously stored SQLite/PostgreSQL events, if any, are **not** deleted by this change;
the team must review and address those separately.

## Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/health` | `{status, model_version, contract_version, days}` |
| GET | `/demo/days` | `{ "<participant>": ["YYYY-MM-DD", ...] }`. Lists days that have at least one of the 17 model inputs |
| GET | `/predictions/{participant}/{date}` | The `predict_profile` output (see `ml/outputs/prediction_contract.json`). Returns 404 when the day can't be replayed |
| POST | `/response` | Body `{estimate, check_in, correction?, history}`. Returns `{kind: "silent", reason}`, `{kind: "offer", suggestion, basis}` or `{kind: "support"}` |
| POST | `/events` | Disabled pending privacy review. Valid bodies return 403; invalid schemas return 422. |

Unknown or inconsistent values return 422. The enums match the web app's TypeScript types.

## Configuration

Set these as environment variables. Defaults are relative to the repo.

| Variable | Default |
|---|---|
| `MODEL_PATH` | `models/studysense_profile_classifier.joblib` |
| `FEATURES_CSV` | `ml/data/daily_features.csv` |
| `EVENTS_DB` | `api/data/events.sqlite3` |
| `DATABASE_URL` | unset. When set, events go to the `app.events` table in that Postgres instead of the SQLite file |
| `CORS_ORIGINS` | `http://localhost:3000` (comma-separated). Only needed when a browser calls the API directly: the web app normally goes through the Next proxy at `/api` |

## Notes

- Questionnaire scores (`reported_*`) are training targets. `FeatureStore` never reads them, so no endpoint can return them.
- Under the current policy (`confidence_threshold: 1.01`), every prediction is `uncertain`. That is expected, and the response rules never act on an uncertain estimate.
- Check-in permission is not research participation consent. No new event collection is enabled in this version.
- The model file is loaded only from `MODEL_PATH`, never from a request. Only load joblib files you trust.

## Deploy on Render (free)

`render.yaml` at the repo root is a Render Blueprint for this API. The build installs `api/requirements.txt` and runs `python -m ml.experiment all`, which retrains the model from the committed SSAQS CSVs. That way the deployed model always matches the committed code and data, and no model file is committed. The build takes a few minutes longer as a result.

1. Push the branch, then in Render go to **New → Blueprint** and pick the repo and branch.
2. `DATABASE_URL` is not needed for event logging in this privacy-disabled version. Do not enable collection during deployment without an approved data-handling policy.
3. Once it's live, check `https://<service>.onrender.com/health`.
4. Point the web app at it: set `API_URL=https://<service>.onrender.com` on the web host before its build.

Free-plan behaviour to plan around:

- **Spin-down:** the service sleeps after 15 minutes without traffic, and the next request takes about a minute. Open `/health` before a demo.
- **No persistent disk:** anything written to disk is lost on restart. That's why events go to Postgres there.
- **750 free hours a month per workspace:** that covers one service running all month.

The ETL (`etl/`) is not hosted. It's a separate one-off load (`python -m etl.run` with `etl/.env`), and the API doesn't read its tables.
