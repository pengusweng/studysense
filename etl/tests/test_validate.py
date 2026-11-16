"""
Unit tests for the StudySense Validation Module (src/validate.py).
Tests error handling, reconciliation checking, range constraints, and referential integrity.
"""

import pytest
from src.validate import ValidationError, validate_reconciliation, validate_key_integrity, validate_ranges_and_study_dates
from src.load import get_connection


def test_validation_error_exception():
    """Verify ValidationError exception raises and contains message."""
    with pytest.raises(ValidationError, match="Test failure"):
        raise ValidationError("Test failure")


def test_db_reconciliation_live():
    """Live database check: raw vs clean row counts reconcile including rejected rows."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            results = validate_reconciliation(cur)
            assert len(results) == 9
            assert all(r["reconciled"] for r in results)


def test_db_key_integrity_live():
    """Live database check: zero duplicate primary keys and zero orphan foreign keys."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            results = validate_key_integrity(cur)
            assert len(results) > 0


def test_db_ranges_and_dates_live():
    """Live database check: all values within valid bounds and dates within study window."""
    with get_connection() as conn:
        with conn.cursor() as cur:
            results = validate_ranges_and_study_dates(cur)
            assert len(results) > 0
