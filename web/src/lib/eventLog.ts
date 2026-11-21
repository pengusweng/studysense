import type { CheckInOutcome } from "./checkIn";
import type { DemoRecord } from "./demoRecord";
import type { FeedbackEntry } from "./feedback";

type LoggedEvent = { kind: "check_in"; checkIn: CheckInOutcome } | ({ kind: "feedback" } & FeedbackEntry);

/**
 * Server event collection is disabled until the team approves purpose,
 * separate research consent (if needed), retention, access and deletion.
 * Voluntary check-ins continue to work in browser-visit state.
 * Previously collected server events are NOT erased by this change.
 */
export function logEvent(_record: DemoRecord, _event: LoggedEvent): void {
  // Intentionally no network request.
}
