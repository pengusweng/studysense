"""Independent regression tests for the approved, student-directed policy."""
import pytest

from api.rules import choose_response, pick
from api.schemas import ResponseRequest

NONE = {"kind": "unavailable", "reason": "none"}
MISSING = {"kind": "missing"}
HSHA = {"kind": "estimate", "profile": "HSHA", "certainty": "confident"}
HSHA_UNCERTAIN = {"kind": "estimate", "profile": "HSHA", "certainty": "uncertain"}
LSLA = {"kind": "estimate", "profile": "LSLA", "certainty": "confident"}


def run(**overrides) -> dict:
    request = ResponseRequest.model_validate({"estimate": NONE, "check_in": "unasked", "history": [], **overrides})
    return choose_response(request).model_dump(exclude_none=True)


@pytest.mark.parametrize("estimate", [HSHA, LSLA, HSHA_UNCERTAIN, MISSING, NONE])
def test_historical_estimates_do_not_drive_student_help(estimate):
    assert run(check_in="swamped", estimate=estimate) == {"kind": "support"}


@pytest.mark.parametrize("estimate", [HSHA, HSHA_UNCERTAIN, NONE, MISSING])
def test_estimate_alone_is_silent(estimate):
    assert run(estimate=estimate) == {"kind": "silent", "reason": "abstain"}


def test_focused_overrides_high_historical_profile():
    assert run(check_in="focused", estimate=HSHA) == {"kind": "silent", "reason": "flow"}


@pytest.mark.parametrize("outcome", ["skipped", "dismissed", "no_response"])
def test_decline_is_silent(outcome):
    assert run(check_in=outcome, estimate=HSHA) == {"kind": "silent", "reason": "declined"}


@pytest.mark.parametrize("need", ["understand", "apply", "remember", "organize", "energy", "workload", "unsure", "other"])
def test_selected_need_is_returned_without_ml(need):
    assert run(check_in="swamped", estimate=HSHA, academic_need=need) == {"kind": "support", "category": need}


def test_student_need_is_not_assigned_from_historical_profile():
    assert run(check_in="swamped", estimate=HSHA) == run(check_in="swamped", estimate=LSLA)


def test_current_manual_request_overrides_previous_focus_or_skipped_checkin():
    for old_checkin in ("focused", "skipped", "unasked"):
        assert run(check_in=old_checkin, academic_need="remember", estimate=HSHA) == {
            "kind": "support", "category": "remember",
        }


def test_correction_fine_silences():
    assert run(check_in="swamped", correction="fine") == {"kind": "silent", "reason": "flow"}


def test_correction_other_opens_options():
    assert run(check_in="swamped", correction="other") == {"kind": "support"}


def test_correction_more_offers_undismissed_option():
    assert run(check_in="swamped", correction="more") == {"kind": "offer", "suggestion": "lighter", "basis": "correction"}
    history = [{"suggestion": "lighter", "action": "dismiss"}]
    assert run(check_in="swamped", correction="more", history=history) == {"kind": "offer", "suggestion": "shorter", "basis": "correction"}


def test_acceptance_never_overrides_prior_refusal():
    history = [{"suggestion": "lighter", "action": "accept"}, {"suggestion": "lighter", "action": "dismiss"}]
    assert run(check_in="swamped", correction="more", history=history)["suggestion"] != "lighter"


def test_all_dismissed_never_reoffer():
    history = [{"suggestion": s, "action": "dismiss"} for s in ["steps", "break", "shorter", "lighter"]]
    assert pick(["steps", "break", "shorter", "lighter"], ResponseRequest.model_validate({
        "estimate": NONE, "check_in": "swamped", "history": history,
    }).history) is None
    assert run(check_in="swamped", correction="more", history=history) == {"kind": "support"}


def test_rejects_unrecognized_academic_need():
    with pytest.raises(ValueError):
        run(academic_need="diagnose-anxiety")
