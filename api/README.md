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

### Local database (optional)

To keep logged events in Postgres instead of the SQLite file, run Postgres in Docker. It listens on host port **6000**, so it won't clash with a Postgres you already have on 5432.

```powershell
docker compose up -d db                 # Postgres 17; data kept in the studysense-db volume
copy api\.env.example api\.env          # DATABASE_URL=postgresql://studysense:studysense@127.0.0.1:6000/studysense
uvicorn api.main:app --reload           # events now go to app.events

docker compose exec db psql -U studysense -c "select * from app.events"
```

Without `api/.env`, the API uses `api/data/events.sqlite3`. If the database is stopped, the API still starts and serves predictions; only event writes fail until it's back.

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
| `DATABASE_URL` | unset. When set, events go to the `app.events` table in that Postgres instead of the SQLite file |
| `CORS_ORIGINS` | `http://localhost:3000` (comma-separated). Only needed when a browser calls the API directly: the web app normally goes through the Next proxy at `/api` |

## Notes

- Questionnaire scores (`reported_*`) are training targets. `FeatureStore` never reads them, so no endpoint can return them.
- Under the current policy (`confidence_threshold: 1.01`), every prediction is `uncertain`. That is expected, and the response rules never act on an uncertain estimate.
- Events are sent only when the student agreed to check-ins. The log is for analysis (a local SQLite file, or `app.events` in Postgres when deployed), not secure production storage.
- The model file is loaded only from `MODEL_PATH`, never from a request. Only load joblib files you trust.

To read the event log:

```powershell
python -c "from api.events import EventLog; from pathlib import Path; print(*EventLog(Path('api/data/events.sqlite3')).all(), sep='\n')"
```

## Deploy on Render (free)

`render.yaml` at the repo root is a Render Blueprint for this API. The build installs `api/requirements.txt` and runs `python -m ml.experiment all`, which retrains the model from the committed SSAQS CSVs. That way the deployed model always matches the committed code and data, and no model file is committed. The build takes a few minutes longer as a result.

1. Push the branch, then in Render go to **New → Blueprint** and pick the repo and branch.
2. When it asks for `DATABASE_URL`, paste a hosted Postgres connection string that's reachable over IPv4 (Render has no IPv6). The Docker database below only runs on your machine, so it can't be used here. The API creates `app.events` on its first write. Leave it empty to run without keeping events.
3. Once it's live, check `https://<service>.onrender.com/health`.
4. Point the web app at it: set `API_URL=https://<service>.onrender.com` on the web host before its build.

Free-plan behaviour to plan around:

- **Spin-down:** the service sleeps after 15 minutes without traffic, and the next request takes about a minute. Open `/health` before a demo.
- **No persistent disk:** anything written to disk is lost on restart. That's why events go to Postgres there.
- **750 free hours a month per workspace:** that covers one service running all month.

The ETL (`etl/`) is not hosted. It's a separate one-off load (`python -m etl.run` with `etl/.env`), and the API doesn't read its tables.
