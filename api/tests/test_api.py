"""Endpoint tests against a small fixture export and a controlled model, so they run without the real artifact."""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import pytest
from fastapi.testclient import TestClient
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline

from api.events import EventLog
from api.main import create_app
from api.settings import Settings
from ml.contracts import CLASSES, CONTRACT_VERSION, FEATURES

CONTRACT = json.loads((Path(__file__).resolve().parents[2] / "ml/outputs/prediction_contract.json").read_text())
VISIT = "0b5c1f0e-8a7d-4c2e-9a51-3f7d2b6c9e10"


@pytest.fixture
def settings(tmp_path):
    x = pd.DataFrame(np.ones((4, len(FEATURES))), columns=FEATURES)
    pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median", keep_empty_features=True)),
        ("model", DummyClassifier(strategy="uniform", random_state=42)),
    ]).fit(x, CLASSES)
    model = tmp_path / "model.joblib"
    joblib.dump({"pipeline": pipeline, "features": FEATURES, "classes": CLASSES, "contract_version": CONTRACT_VERSION,
                 "model_version": "test", "policy": {"max_missing_fraction": .5, "confidence_threshold": .7,
                                                     "margin_threshold": .1}}, model)
    full = dict.fromkeys(FEATURES, 10.0)
    sparse = {name: (10.0 if i < 3 else None) for i, name in enumerate(FEATURES)}  # 14 of 17 missing
    empty = dict.fromkeys(FEATURES, None)  # not replayable
    rows = [
        {"participant_id": 1, "date": "2025-02-24", **full, "reported_stress_mean": 80, "reported_anxiety_mean": 80},
        {"participant_id": 1, "date": "2025-02-25", **sparse, "reported_stress_mean": 10, "reported_anxiety_mean": 10},
        {"participant_id": 2, "date": "2025-03-01", **empty, "reported_stress_mean": 50, "reported_anxiety_mean": 50},
        {"participant_id": 2, "date": "2025-03-02", **full, "reported_stress_mean": None, "reported_anxiety_mean": None},
    ]
    csv = tmp_path / "daily_features.csv"
    pd.DataFrame(rows).to_csv(csv, index=False)
    return Settings(model_path=model, features_csv=csv, events_db=tmp_path / "events.sqlite3",
                    cors_origins=("http://localhost:3000",))


@pytest.fixture
def client(settings):
    with TestClient(create_app(settings)) as c:
        yield c


def test_health_reports_the_loaded_model(client):
    assert client.get("/health").json() == {"status": "ok", "model_version": "test",
                                            "contract_version": CONTRACT_VERSION, "days": 3}


def test_days_list_only_days_with_model_inputs(client):
    assert client.get("/demo/days").json() == {"1": ["2025-02-24", "2025-02-25"], "2": ["2025-03-02"]}


def test_prediction_follows_the_contract(client):
    body = client.get("/predictions/1/2025-02-24").json()
    # The contract file lists the decision fields; predict_profile adds the version and missing-feature fields.
    assert set(body) == set(CONTRACT) - {"version", "additional", "invalid_input"} | {
        "model_version", "contract_version", "missing_features"}
    assert body["contract_version"] == CONTRACT["version"]
    assert body["evidence_status"] == "uncertain"
    assert body["fallback_recommendation"] == "clarify_or_defer"
    assert body["predicted_profile"] in CLASSES
    assert body["missing_features"] == []


def test_prediction_never_carries_questionnaire_values(client):
    assert "reported" not in client.get("/predictions/1/2025-02-24").text


def test_mostly_missing_day_is_missing_evidence(client):
    body = client.get("/predictions/1/2025-02-25").json()
    assert body["evidence_status"] == "missing_evidence"
    assert body["predicted_profile"] is None
    assert len(body["missing_features"]) == 14


@pytest.mark.parametrize("path", ["/predictions/2/2025-03-01", "/predictions/9/2025-02-24"])
def test_unreplayable_day_is_404(client, path):
    assert client.get(path).status_code == 404


@pytest.mark.parametrize("path", ["/predictions/1/24-02-2025", "/predictions/0/2025-02-24"])
def test_malformed_record_is_422(client, path):
    assert client.get(path).status_code == 422


def test_response_runs_the_rules(client):
    body = {"estimate": {"kind": "estimate", "profile": "HSHA", "certainty": "confident"}, "check_in": "swamped",
            "history": [{"suggestion": "steps", "action": "dismiss"}]}
    assert client.post("/response", json=body).json() == {"kind": "offer", "suggestion": "break",
                                                          "basis": "check-in+estimate"}


@pytest.mark.parametrize("body", [
    {"estimate": {"kind": "missing"}, "check_in": "stressed"},
    {"estimate": {"kind": "estimate", "profile": "XX", "certainty": "confident"}, "check_in": "swamped"},
    {"estimate": {"kind": "missing"}, "check_in": "swamped", "correction": "fine", "extra": 1},
])
def test_response_rejects_unknown_values(client, body):
    assert client.post("/response", json=body).status_code == 422


def test_events_are_appended(client, settings):
    base = {"visit_id": VISIT, "participant": 1, "date": "2025-02-24"}
    assert client.post("/events", json={**base, "kind": "check_in", "check_in": "swamped"}).status_code == 204
    feedback = {**base, "kind": "feedback", "suggestion": "steps", "action": "correct", "correction": "more"}
    assert client.post("/events", json=feedback).status_code == 204
    rows = EventLog(settings.events_db).all()
    assert [(r["kind"], r["check_in"], r["suggestion"], r["action"], r["correction"]) for r in rows] == [
        ("check_in", "swamped", None, None, None),
        ("feedback", None, "steps", "correct", "more"),
    ]
    assert all(r["visit_id"] == VISIT and r["received_at"] for r in rows)


@pytest.mark.parametrize("event", [
    {"kind": "check_in"},
    {"kind": "check_in", "check_in": "swamped", "suggestion": "steps"},
    {"kind": "feedback", "suggestion": "steps"},
    {"kind": "feedback", "suggestion": "steps", "action": "correct"},
    {"kind": "feedback", "suggestion": "steps", "action": "accept", "correction": "fine"},
    {"kind": "check_in", "check_in": "unasked"},
])
def test_inconsistent_events_are_rejected(client, event):
    body = {"visit_id": VISIT, "participant": 1, "date": "2025-02-24", **event}
    assert client.post("/events", json=body).status_code == 422


def test_startup_fails_clearly_without_the_model(settings, tmp_path):
    missing = Settings(model_path=tmp_path / "nope.joblib", features_csv=settings.features_csv,
                       events_db=settings.events_db, cors_origins=())
    with pytest.raises(RuntimeError, match="ml.experiment all"):
        with TestClient(create_app(missing)):
            pass
