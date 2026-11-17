import type { SupportId } from "./supportOptions";
import { createSessionValue } from "./sessionValue";

/**
 * What the student did with each suggestion this visit (issue #7). The next suggestion reads it, so a dismissed
 * one isn't offered again and an accepted one comes first. It informs response selection only: nothing is
 * retrained and nothing is learned. Kept apart from the SSAQS data, for this visit only.
 */
export type Correction = "fine" | "more" | "other";
export type FeedbackAction = "accept" | "dismiss" | "correct";
export type FeedbackEntry = { suggestion: SupportId; action: FeedbackAction; correction?: Correction };

const ACTIONS: readonly FeedbackAction[] = ["accept", "dismiss", "correct"];

function isEntry(raw: unknown): raw is FeedbackEntry {
  if (typeof raw !== "object" || raw === null) return false;
  const e = raw as Record<string, unknown>;
  return typeof e.suggestion === "string" && ACTIONS.includes(e.action as FeedbackAction);
}

const store = createSessionValue<FeedbackEntry[]>("studysense.feedback", [], (raw) =>
  Array.isArray(raw) && raw.every(isEntry) ? raw : null,
);

export function useFeedbackHistory(): FeedbackEntry[] {
  return store.useValue()[0];
}

export function recordFeedback(entry: FeedbackEntry) {
  store.write([...store.read(), entry]);
}

export function clearFeedback() {
  store.write([]);
}
