"""The rule-based response (web/docs/AGENTS.md §7), ported from the web app's responseRules.ts.

Least intrusive by default: nothing is offered unless the student asked for a hand, in the check-in or in a
correction. An estimate alone never prompts. Responses are predefined templates picked by rules (rule 11).
"""
from __future__ import annotations

from api.schemas import (
    Correction,
    EstimateView,
    FeedbackEntry,
    Offer,
    ResponseDecision,
    ResponseRequest,
    Silent,
    Support,
    SupportId,
)

# "A hand would help": first a smaller step, then a short break (the two named for HSHA in §7).
HAND_ORDER: list[SupportId] = ["steps", "break", "shorter", "lighter"]
# "It's more than this": something lighter first, then easing the pace.
MORE_ORDER: list[SupportId] = ["lighter", "shorter", "break", "steps"]


def pick(order: list[SupportId], history: list[FeedbackEntry]) -> SupportId:
    """The next interaction uses the feedback: skip what was dismissed, put what was accepted first."""
    dismissed = {e.suggestion for e in history if e.action == "dismiss"}
    accepted = {e.suggestion for e in history if e.action == "accept"}
    candidates = [s for s in order if s not in dismissed] or order
    return next((s for s in candidates if s in accepted), candidates[0])


def estimate_agrees(estimate: EstimateView) -> bool:
    """Only a confident HSHA estimate counts as agreeing evidence; uncertain or missing evidence never does."""
    return estimate.kind == "estimate" and estimate.certainty == "confident" and estimate.profile == "HSHA"


def choose_response(request: ResponseRequest) -> ResponseDecision:
    correction: Correction | None = request.correction
    history = request.history

    # A correction speaks over everything else: the student knows their situation better than the replayed day.
    if correction == "fine":
        return Silent(reason="flow")
    if correction == "other":
        return Support()
    if correction == "more":
        return Offer(suggestion=pick(MORE_ORDER, history), basis="correction")

    check_in = request.check_in
    # Comfortable and focused preserves flow, even against an elevated estimate (§7 row 2).
    if check_in == "focused":
        return Silent(reason="flow")
    # Declined in any form: continue, and never repeat the prompt (§7 row 5).
    if check_in in ("skipped", "dismissed", "no_response"):
        return Silent(reason="declined")
    # Not asked, or opted out: an estimate on its own never interrupts. Abstaining is the least intrusive way to
    # handle uncertain or contradictory evidence (§7 row 3).
    if check_in == "unasked":
        return Silent(reason="abstain")
    # Swamped: support is offered whatever the profile, including none (§7 row 4). LSLA, LSHA and HSLA have no
    # specific rules yet (§14.4), so they take this generic path.
    return Offer(
        suggestion=pick(HAND_ORDER, history),
        basis="check-in+estimate" if estimate_agrees(request.estimate) else "check-in",
    )
