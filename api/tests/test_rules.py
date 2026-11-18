"""The response rules' cases, carried over from the web app's responseRules.test.ts."""
import pytest

from api.rules import choose_response
from api.schemas import ResponseRequest

NONE = {"kind": "unavailable", "reason": "none"}
MISSING = {"kind": "missing"}
HSHA = {"kind": "estimate", "profile": "HSHA", "certainty": "confident"}
HSHA_UNCERTAIN = {"kind": "estimate", "profile": "HSHA", "certainty": "uncertain"}
LSLA = {"kind": "estimate", "profile": "LSLA", "certainty": "confident"}


def run(**overrides) -> dict:
    request = ResponseRequest.model_validate({"estimate": NONE, "check_in": "unasked", "history": [], **overrides})
    return choose_response(request).model_dump()


def test_focused_preserves_flow_even_with_an_elevated_estimate():
    assert run(check_in="focused", estimate=HSHA) == {"kind": "silent", "reason": "flow"}


@pytest.mark.parametrize("check_in", ["skipped", "dismissed", "no_response"])
def test_declined_is_never_repeated(check_in):
    assert run(check_in=check_in, estimate=HSHA) == {"kind": "silent", "reason": "declined"}


@pytest.mark.parametrize("estimate", [HSHA, HSHA_UNCERTAIN, NONE, MISSING])
def test_an_estimate_alone_never_prompts(estimate):
    assert run(estimate=estimate) == {"kind": "silent", "reason": "abstain"}


def test_swamped_with_confident_hsha_offers_a_smaller_step_backed_by_both():
    assert run(check_in="swamped", estimate=HSHA) == {"kind": "offer", "suggestion": "steps", "basis": "check-in+estimate"}


@pytest.mark.parametrize("estimate", [NONE, MISSING, LSLA, HSHA_UNCERTAIN])
def test_swamped_with_any_other_estimate_offers_support_on_the_check_in_alone(estimate):
    assert run(check_in="swamped", estimate=estimate) == {"kind": "offer", "suggestion": "steps", "basis": "check-in"}


def test_correction_fine_preserves_flow():
    assert run(check_in="swamped", correction="fine") == {"kind": "silent", "reason": "flow"}


def test_correction_more_offers_something_lighter():
    assert run(check_in="swamped", correction="more") == {"kind": "offer", "suggestion": "lighter", "basis": "correction"}


def test_correction_other_opens_the_whole_support_list():
    assert run(check_in="swamped", correction="other") == {"kind": "support"}


def test_a_dismissed_suggestion_is_skipped_next_time():
    history = [{"suggestion": "steps", "action": "dismiss"}]
    assert run(check_in="swamped", history=history) == {"kind": "offer", "suggestion": "break", "basis": "check-in"}


def test_an_accepted_suggestion_is_offered_first():
    history = [{"suggestion": "shorter", "action": "accept"}]
    assert run(check_in="swamped", history=history) == {"kind": "offer", "suggestion": "shorter", "basis": "check-in"}


def test_when_every_suggestion_was_dismissed_the_first_is_offered_again():
    history = [{"suggestion": s, "action": "dismiss"} for s in ["steps", "break", "shorter", "lighter"]]
    assert run(check_in="swamped", history=history) == {"kind": "offer", "suggestion": "steps", "basis": "check-in"}
