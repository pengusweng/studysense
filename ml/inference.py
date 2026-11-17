"""Offline replay API. Only load trusted joblib artifacts."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from ml.contracts import CLASSES, CONTRACT_VERSION, FEATURES, validate_features

DEFAULT_MODEL = Path(__file__).resolve().parents[1] / "models/studysense_profile_classifier.joblib"


def decision(probabilities, missing_fraction, policy):
    """Same decision rule for development validation, final test and replay."""
    probabilities = np.asarray(probabilities, dtype=float)
    ordered = np.sort(probabilities)
    confidence = float(ordered[-1])
    margin = float(ordered[-1] - ordered[-2])
    missing = missing_fraction > policy["max_missing_fraction"]
    uncertain = missing or confidence < policy["confidence_threshold"] or margin < policy["margin_threshold"]
    return {
        "predicted_profile": None if missing else CLASSES[int(np.argmax(probabilities))],
        "probabilities": dict(zip(CLASSES, [None] * 4 if missing else probabilities.tolist())),
        "confidence_score": 0.0 if missing else confidence,
        "is_uncertain": bool(uncertain),
        "evidence_status": "missing_evidence" if missing else "uncertain" if uncertain else "confident",
        "fallback_recommendation": "clarify_or_defer" if uncertain else "proceed",
    }


@lru_cache(maxsize=4)
def load_artifact(path):
    artifact = joblib.load(path)
    if artifact["contract_version"] != CONTRACT_VERSION or artifact["features"] != FEATURES or artifact["classes"] != CLASSES:
        raise ValueError("Incompatible model contract")
    return artifact


def predict_profile(features_dict: dict, model_path=DEFAULT_MODEL) -> dict:
    values = validate_features(features_dict)
    artifact = load_artifact(str(Path(model_path).resolve()))
    x = pd.DataFrame([values], columns=FEATURES, dtype=float)
    missing_fraction = float(x.isna().mean(axis=1).iloc[0])
    if missing_fraction > artifact["policy"]["max_missing_fraction"]:
        result = decision([0.25] * 4, missing_fraction, artifact["policy"])
    else:
        pipeline = artifact["pipeline"]
        raw = pipeline.predict_proba(x)[0]
        probabilities = np.zeros(4)
        for label, prob in zip(pipeline.classes_, raw):
            probabilities[CLASSES.index(str(label))] = float(prob)
        result = decision(probabilities, missing_fraction, artifact["policy"])
    return {**result, "model_version": artifact["model_version"], "contract_version": CONTRACT_VERSION,
            "missing_features": [name for name, value in values.items() if value is None]}
