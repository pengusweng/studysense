"""Strict API schemas for predictions, student-directed responses, and event contracts."""
from __future__ import annotations

from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator

Profile = Literal["LSLA", "LSHA", "HSLA", "HSHA"]
SupportId = Literal["steps", "break", "shorter", "lighter"]
AcademicNeed = Literal["understand", "apply", "remember", "organize", "energy", "workload", "unsure", "other"]
CheckInOutcome = Literal["focused", "swamped", "skipped", "dismissed", "no_response"]
CheckInState = Literal["unasked", "focused", "swamped", "skipped", "dismissed", "no_response"]
Correction = Literal["fine", "more", "other"]
FeedbackAction = Literal["accept", "dismiss", "correct"]

ISO_DATE = r"^\d{4}-\d{2}-\d{2}$"


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


# Predictions are about historical SSAQS records, not app users.
class Prediction(Strict):
    predicted_profile: Profile | None
    probabilities: dict[Profile, float | None]
    confidence_score: float
    is_uncertain: bool
    evidence_status: Literal["confident", "uncertain", "missing_evidence"]
    fallback_recommendation: Literal["proceed", "clarify_or_defer"]
    model_version: str
    contract_version: str
    missing_features: list[str]


class Health(Strict):
    status: Literal["ok"]
    model_version: str
    contract_version: str
    days: int


class EstimateLoading(Strict):
    kind: Literal["loading"]


class EstimateUnavailable(Strict):
    kind: Literal["unavailable"]
    reason: Literal["record", "none"]


class EstimateMissing(Strict):
    kind: Literal["missing"]


class EstimateShown(Strict):
    kind: Literal["estimate"]
    profile: Profile
    certainty: Literal["confident", "uncertain"]


EstimateView = Annotated[
    Union[EstimateLoading, EstimateUnavailable, EstimateMissing, EstimateShown], Field(discriminator="kind")
]


class FeedbackEntry(Strict):
    suggestion: SupportId
    action: FeedbackAction
    correction: Correction | None = None


class ResponseRequest(Strict):
    estimate: EstimateView
    check_in: CheckInState
    correction: Correction | None = None
    academic_need: AcademicNeed | None = None
    history: list[FeedbackEntry] = Field(default_factory=list, max_length=200)


class Silent(Strict):
    kind: Literal["silent"] = "silent"
    reason: Literal["flow", "declined", "abstain"]


class Offer(Strict):
    kind: Literal["offer"] = "offer"
    suggestion: SupportId
    basis: Literal["check-in", "correction"]


class Support(Strict):
    kind: Literal["support"] = "support"
    category: AcademicNeed | None = None


ResponseDecision = Annotated[Union[Silent, Offer, Support], Field(discriminator="kind")]


# Legacy event schema is retained for compatibility but /events is disabled
# pending approved retention, consent and deletion policy.
class Event(Strict):
    visit_id: str = Field(pattern=r"^[0-9a-fA-F-]{36}$")
    kind: Literal["check_in", "feedback"]
    participant: int = Field(ge=1)
    date: str = Field(pattern=ISO_DATE)
    check_in: CheckInOutcome | None = None
    suggestion: SupportId | None = None
    action: FeedbackAction | None = None
    correction: Correction | None = None

    @model_validator(mode="after")
    def _fields_match_kind(self) -> "Event":
        if self.kind == "check_in":
            if self.check_in is None or any(v is not None for v in (self.suggestion, self.action, self.correction)):
                raise ValueError("a check_in event carries check_in only")
        else:
            if self.check_in is not None or self.suggestion is None or self.action is None:
                raise ValueError("a feedback event carries suggestion and action")
            if (self.action == "correct") != (self.correction is not None):
                raise ValueError("correction is given exactly when action is 'correct'")
        return self
