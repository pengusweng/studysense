"""The replayable SSAQS participant-days and their 17 model inputs, read from ml.data's export."""
from __future__ import annotations

import math
from pathlib import Path

import pandas as pd

from ml.contracts import FEATURES


class FeatureStore:
    """Holds only the model's input columns: questionnaire scores are targets, never inputs (AGENTS.md rule 10)."""

    def __init__(self, csv_path: Path):
        frame = pd.read_csv(csv_path, usecols=["participant_id", "date", *FEATURES])
        # Same eligibility as ml/data.py: a day with none of the 17 inputs can't be replayed.
        frame = frame.loc[frame[FEATURES].notna().any(axis=1)]
        self._rows: dict[tuple[int, str], dict[str, float | None]] = {}
        for record in frame.to_dict("records"):
            key = (int(record["participant_id"]), str(record["date"]))
            self._rows[key] = {name: _number(record[name]) for name in FEATURES}

    def __len__(self) -> int:
        return len(self._rows)

    def features(self, participant: int, date: str) -> dict[str, float | None] | None:
        row = self._rows.get((participant, date))
        return dict(row) if row is not None else None

    def days(self) -> dict[int, list[str]]:
        days: dict[int, list[str]] = {}
        for participant, date in sorted(self._rows):
            days.setdefault(participant, []).append(date)
        return days


def _number(value) -> float | None:
    return None if value is None or (isinstance(value, float) and math.isnan(value)) else float(value)
