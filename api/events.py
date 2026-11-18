"""Append-only log of check-in and feedback events, for later analysis. Nothing reads it back into the model.

Locally the log is a SQLite file. When DATABASE_URL is set (a deployed host, whose disk is wiped on restart), it is
the app.events table in Postgres, in its own schema so Supabase's public API never exposes it.
"""
from __future__ import annotations

import logging
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
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

PG_SCHEMA = """
CREATE SCHEMA IF NOT EXISTS app;
CREATE TABLE IF NOT EXISTS app.events (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    received_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    visit_id     UUID NOT NULL,
    kind         TEXT NOT NULL CHECK (kind IN ('check_in', 'feedback')),
    participant  INTEGER NOT NULL,
    date         DATE NOT NULL,
    check_in     TEXT,
    suggestion   TEXT,
    action       TEXT,
    correction   TEXT
);
"""

log = logging.getLogger(__name__)


class EventLog:
    def __init__(self, path: Path):
        self.path = path
        path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as db:
            db.execute(SCHEMA)

    @contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        """Commits on success and always closes: sqlite3's own context manager commits but leaves it open."""
        db = sqlite3.connect(self.path)
        try:
            with db:
                yield db
        finally:
            db.close()

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


class PostgresEventLog:
    """The same log in Postgres. A database that is down or paused never stops the API from starting: the table is
    created on the first write that can reach it, and until then each write fails on its own."""

    def __init__(self, url: str):
        self.url = url
        self._ready = False
        try:
            self._ensure_table()
        except Exception as error:  # noqa: BLE001 - logged, retried on the next write
            log.warning("Event log database not reachable at startup: %s", error)

    def _connect(self):
        import psycopg

        # No server-side prepared statements, so Supabase's transaction pooler (port 6543) works too.
        return psycopg.connect(self.url, prepare_threshold=None, connect_timeout=5)

    def _ensure_table(self) -> None:
        if self._ready:
            return
        with self._connect() as db:
            db.execute(PG_SCHEMA)
        self._ready = True

    def append(self, event: Event) -> None:
        self._ensure_table()
        values = [getattr(event, c) for c in COLUMNS]
        with self._connect() as db:
            db.execute(
                f"INSERT INTO app.events ({', '.join(COLUMNS)}) VALUES ({', '.join(['%s'] * len(COLUMNS))})",
                values,
            )

    def all(self) -> list[dict]:
        from psycopg.rows import dict_row

        with self._connect() as db, db.cursor(row_factory=dict_row) as cur:
            return list(cur.execute("SELECT * FROM app.events ORDER BY id"))


def open_event_log(database_url: str | None, sqlite_path: Path) -> EventLog | PostgresEventLog:
    return PostgresEventLog(database_url) if database_url else EventLog(sqlite_path)
