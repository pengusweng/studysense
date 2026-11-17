import { readConsent, useKnownConsent } from "./consent";
import { readPreferences, useKnownPreferences, type AskWhen } from "./preferences";
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

/**
 * Whether the question is due at this moment of the session: the student opted in during setup, hasn't been
 * asked yet, and chose this moment in Preferences (the first pause by default, or only after ending).
 */
export function useCheckInDue(moment: AskWhen): boolean {
  const consent = useKnownConsent();
  const prefs = useKnownPreferences();
  const state = store.useKnownValue();
  return optedIn(consent) && prefs?.askWhen === moment && state === "unasked";
}

/**
 * Leaving a pause with the question untouched is an outcome too, and it isn't asked again this session.
 * Only when the question belongs to the pause: one saved for the end of the session hasn't been asked yet.
 */
export function closeUnanswered() {
  if (readPreferences().askWhen !== "pause") return;
  if (optedIn(readConsent()) && store.read() === "unasked") store.write("no_response");
}
