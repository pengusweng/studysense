"""Deterministic, student-directed academic support decisions.

The SSAQS estimate describes a historical participant-day. It is never evidence
about the current student's needs and never influences their support choice.
"""
from __future__ import annotations

from api.schemas import (
    Correction,
    FeedbackEntry,
    Offer,
    ResponseDecision,
    ResponseRequest,
    Silent,
    Support,
    SupportId,
)

HAND_ORDER: list[SupportId] = ["steps", "break", "shorter", "lighter"]
MORE_ORDER: list[SupportId] = ["lighter", "shorter", "break", "steps"]


def pick(order: list[SupportId], history: list[FeedbackEntry]) -> SupportId | None:
    """Choose an unrefused option, returning None when all were dismissed."""
    dismissed = {entry.suggestion for entry in history if entry.action == "dismiss"}
    accepted = {entry.suggestion for entry in history if entry.action == "accept"}
    candidates = [suggestion for suggestion in order if suggestion not in dismissed]
    if not candidates:
        return None
    return next((suggestion for suggestion in candidates if suggestion in accepted), candidates[0])


def choose_response(request: ResponseRequest) -> ResponseDecision:
    # The student's current refusal always overrides anything else.
    if request.correction == "fine":
        return Silent(reason="flow")
    # A direct, current request for academic help overrides a previous check-in.
    # Historical data are never used to select this category.
    if request.academic_need is not None:
        return Support(category=request.academic_need)
    if request.check_in == "focused":
        return Silent(reason="flow")
    if request.check_in in ("skipped", "dismissed", "no_response"):
        return Silent(reason="declined")

    correction: Correction | None = request.correction
    if correction == "other":
        return Support()
    if correction == "more":
        suggestion = pick(MORE_ORDER, request.history)
        return Offer(suggestion=suggestion, basis="correction") if suggestion is not None else Support()

    # No automatic offer during study. A help-seeking check-in opens the
    # optional academic-needs question instead of choosing a break or task.
    if request.check_in == "swamped":
        return Support()

    return Silent(reason="abstain")
