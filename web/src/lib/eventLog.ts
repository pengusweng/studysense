import type { CheckInOutcome } from "./checkIn";
import { readConsent } from "./consent";
import type { DemoRecord } from "./demoRecord";
import type { FeedbackEntry } from "./feedback";
import { http } from "./http";
import { readVisitId } from "./visitId";

type LoggedEvent = { kind: "check_in"; checkIn: CheckInOutcome } | ({ kind: "feedback" } & FeedbackEntry);

/**
 * Sends one check-in outcome or piece of feedback to the API's event log (api/events.py), only when the student
 * agreed to check-ins in setup. Fire and forget: a failed send never touches the session.
 */
export function logEvent(record: DemoRecord, event: LoggedEvent) {
  const consent = readConsent();
  if (consent === "undecided" || consent.checkIns !== "yes") return;
  const detail =
    event.kind === "check_in"
      ? { check_in: event.checkIn }
      : { suggestion: event.suggestion, action: event.action, correction: event.correction ?? null };
  const body = { visit_id: readVisitId(), kind: event.kind, participant: record.participant, date: record.date, ...detail };
  http<void>("/events", { method: "POST", body: JSON.stringify(body) }).catch(() => {});
}
