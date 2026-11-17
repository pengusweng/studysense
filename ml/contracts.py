"""Versioned feature schema. Questionnaire fields are deliberately excluded."""
from __future__ import annotations

import math
from numbers import Real

CLASSES = ["LSLA", "LSHA", "HSLA", "HSHA"]
FEATURES = [
    "total_steps", "mean_steps_per_min", "max_steps_per_min", "active_minutes",
    "sedentary_minutes", "lightly_active_minutes", "moderately_active_minutes",
    "very_active_minutes", "mean_rmssd", "min_rmssd", "max_rmssd",
    "mean_coverage", "mean_low_frequency", "mean_high_frequency",
    "hrv_reading_count", "sleep_overall_score", "deep_sleep_minutes",
]
CONTRACT_VERSION = "1.0.0"
BOUNDS = {name: [0, None] for name in FEATURES}
for name in FEATURES:
    if name.endswith("minutes"):
        BOUNDS[name] = [0, 1440]
BOUNDS["sleep_overall_score"] = [0, 100]


def validate_features(features: dict) -> dict:
    """Omitted/None values are missing; malformed or extra fields are errors."""
    if not isinstance(features, dict):
        raise ValueError("features must be a dictionary")
    extra = set(features) - set(FEATURES)
    if extra:
        raise ValueError(f"Unknown feature fields: {sorted(extra)}")
    values = {}
    for name in FEATURES:
        value = features.get(name)
        if value is None:
            values[name] = None
            continue
        if isinstance(value, bool) or not isinstance(value, Real) or not math.isfinite(value):
            raise ValueError(f"{name} must be a finite number or null")
        low, high = BOUNDS[name]
        if value < low or (high is not None and value > high):
            raise ValueError(f"{name} outside contract bounds {BOUNDS[name]}")
        values[name] = float(value)
    return values


def feature_contract() -> dict:
    return {
        "version": CONTRACT_VERSION, "features": FEATURES, "bounds": BOUNDS,
        "unit_of_analysis": "participant UTC day", "additional_fields": False,
        "missing_values": "omit field or supply JSON null; no NaN/Infinity",
        "timing": "Retrospective completed-day classification; available after UTC day closes.",
        "excluded": "participant/date IDs, all questionnaires, SpO2, proprietary Fitbit stress",
        "units": "steps counts; activity/deep sleep minutes; RMSSD ms; coverage ratio; spectral power as in SSAQS",
    }
