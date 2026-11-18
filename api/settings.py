"""Where the API finds the ML pipeline's outputs. Paths come from here only, never from a request."""
from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from ml.data import DATA
from ml.inference import DEFAULT_MODEL

ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    model_path: Path
    features_csv: Path
    events_db: Path
    cors_origins: tuple[str, ...]

    @classmethod
    def from_env(cls) -> "Settings":
        origins = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
        return cls(
            model_path=Path(os.environ.get("MODEL_PATH", DEFAULT_MODEL)),
            features_csv=Path(os.environ.get("FEATURES_CSV", DATA / "daily_features.csv")),
            events_db=Path(os.environ.get("EVENTS_DB", ROOT / "api/data/events.sqlite3")),
            cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
        )
