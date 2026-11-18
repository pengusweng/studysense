"""StudySense API: replays SSAQS participant-days through the trained profile model.

Run from the repo root: uvicorn api.main:app --reload
"""
from __future__ import annotations

from contextlib import asynccontextmanager
from functools import lru_cache

from fastapi import FastAPI, HTTPException, Path, Response
from fastapi.middleware.cors import CORSMiddleware

from api.events import EventLog
from api.features import FeatureStore
from api.rules import choose_response
from api.schemas import ISO_DATE, Event, Health, Prediction, ResponseDecision, ResponseRequest
from api.settings import Settings
from ml.contracts import CONTRACT_VERSION
from ml.inference import load_artifact, predict_profile

SETUP_HINT = "Run `python -m ml.experiment all` from the repo root to build it."


def create_app(settings: Settings | None = None) -> FastAPI:
    settings = settings or Settings.from_env()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        for label, path in (("Model", settings.model_path), ("Feature export", settings.features_csv)):
            if not path.is_file():
                raise RuntimeError(f"{label} not found at {path}. {SETUP_HINT}")
        # Fails here, not on the first request, when the model's contract doesn't match ml/contracts.py.
        artifact = load_artifact(str(settings.model_path.resolve()))
        store = FeatureStore(settings.features_csv)

        @lru_cache(maxsize=None)
        def predict(participant: int, date: str) -> dict | None:
            features = store.features(participant, date)
            return None if features is None else predict_profile(features, settings.model_path)

        app.state.model_version = artifact["model_version"]
        app.state.store = store
        app.state.predict = predict
        app.state.events = EventLog(settings.events_db)
        yield

    app = FastAPI(title="StudySense API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(settings.cors_origins),
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.get("/health", response_model=Health)
    def health() -> Health:
        return Health(
            status="ok",
            model_version=app.state.model_version,
            contract_version=CONTRACT_VERSION,
            days=len(app.state.store),
        )

    @app.get("/demo/days", response_model=dict[int, list[str]])
    def demo_days() -> dict[int, list[str]]:
        """Replayable participant-days: those with at least one of the model's 17 inputs."""
        return app.state.store.days()

    @app.get("/predictions/{participant}/{date}", response_model=Prediction)
    def prediction(participant: int = Path(ge=1), date: str = Path(pattern=ISO_DATE)) -> dict:
        """The day's profile from predict_profile, exactly as ml/outputs/prediction_contract.json defines it."""
        result = app.state.predict(participant, date)
        if result is None:
            raise HTTPException(status_code=404, detail="No replayable record for this participant and date")
        return result

    @app.post("/response", response_model=ResponseDecision)
    def response(request: ResponseRequest) -> ResponseDecision:
        """The rule-based response to a check-in or correction (web/docs/AGENTS.md §7)."""
        return choose_response(request)

    @app.post("/events", status_code=204)
    def log_event(event: Event) -> Response:
        app.state.events.append(event)
        return Response(status_code=204)

    return app


app = create_app()
