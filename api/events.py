"""Append-only log of check-in and feedback events, for later analysis. Nothing reads it back into the model."""
from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path

from api.schemas import Event

SCHEMA = """
CREATE TABLE IF NOT EXISTS events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    received_at  TEXT NOT NULL,
    visit_id     TEXT NOT NULL,
    kind         TEXT NOT NULL CHECK (kind IN ('check_in', 'feedback')),
    participant  INTEGER NOT NULL,
    date         TEXT NOT NULL,
    check_in     TEXT,
    suggestion   TEXT,
    action       TEXT,
    correction   TEXT
)
"""

COLUMNS = ("visit_id", "kind", "participant", "date", "check_in", "suggestion", "action", "correction")


class EventLog:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as db:
            db.execute(SCHEMA)

    def _connect(self) -> sqlite3.Connection:
        return sqlite3.connect(self.path)

    def append(self, event: Event) -> None:
        values = [getattr(event, c) for c in COLUMNS]
        received_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
        with self._connect() as db:
            db.execute(
                f"INSERT INTO events (received_at, {', '.join(COLUMNS)}) VALUES (?{', ?' * len(COLUMNS)})",
                [received_at, *values],
            )

    def all(self) -> list[dict]:
        with self._connect() as db:
            db.row_factory = sqlite3.Row
            return [dict(r) for r in db.execute("SELECT * FROM events ORDER BY id")]
