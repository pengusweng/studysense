import { readConsent, useKnownConsent } from "./consent";
import { createSessionValue } from "./sessionValue";

/**
 * The session's one optional check-in (issue #5) and how it ended. This is the student's own context for this
 * visit, kept apart from the SSAQS questionnaire answers in the replayed data (docs/AGENTS.md §2 rule 10).
 * "unasked" until the session's first pause.
 */
export type CheckInOutcome = "focused" | "swamped" | "skipped" | "dismissed" | "no_response";
export type CheckInState = CheckInOutcome | "unasked";

const STATES: readonly CheckInState[] = ["unasked", "focused", "swamped", "skipped", "dismissed", "no_response"];

const store = createSessionValue<CheckInState>("studysense.checkIn", "unasked", (raw) =>
  STATES.includes(raw as CheckInState) ? (raw as CheckInState) : null,
);

export const recordCheckIn = (outcome: CheckInOutcome) => store.write(outcome);
export const resetCheckIn = () => store.write("unasked");

function optedIn(consent: ReturnType<typeof readConsent> | null): boolean {
  return consent !== null && consent !== "undecided" && consent.checkIns === "yes";
}

/** Whether the question is still due this session: the student opted in during setup and hasn't been asked. */
export function useCheckInDue(): boolean {
  const consent = useKnownConsent();
  const state = store.useKnownValue();
  return optedIn(consent) && state === "unasked";
}

/** Leaving a pause with the question untouched is an outcome too, and it isn't asked again this session. */
export function closeUnanswered() {
  if (optedIn(readConsent()) && store.read() === "unasked") store.write("no_response");
}
