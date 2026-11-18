import type { CheckInState } from "../../../lib/checkIn";
import type { Correction, FeedbackEntry } from "../../../lib/feedback";
import type { SupportId } from "../../../lib/supportOptions";
import type { EstimateView } from "../types";

/**
 * The rule-based response (docs/AGENTS.md §7). Pure and client-side for now, so it can move behind an API without
 * touching the UI (§14.5). Only type imports, so `npm test` runs it with plain Node.
 *
 * Least intrusive by default: nothing is offered unless the student asked for a hand, in the check-in or in a
 * correction. An estimate alone never prompts.
 */
export type ResponseDecision =
  | { kind: "silent"; reason: "flow" | "declined" | "abstain" }
  | { kind: "offer"; suggestion: SupportId; basis: "check-in" | "check-in+estimate" | "correction" }
  /** "Something else is going on": the whole support list, as an explicit help request. */
  | { kind: "support" };

export type ResponseInput = {
  estimate: EstimateView;
  checkIn: CheckInState;
  correction?: Correction;
  /** Feedback on earlier suggestions this visit. */
  history: FeedbackEntry[];
};

/** "A hand would help": first a smaller step, then a short break (the two named for HSHA in §7). */
const HAND_ORDER: SupportId[] = ["steps", "break", "shorter", "lighter"];
/** "It's more than this": something lighter first, then easing the pace. */
const MORE_ORDER: SupportId[] = ["lighter", "shorter", "break", "steps"];

/** The next interaction uses the feedback: skip what was dismissed, put what was accepted first. */
function pick(order: SupportId[], history: FeedbackEntry[]): SupportId {
  const dismissed = new Set(history.filter((e) => e.action === "dismiss").map((e) => e.suggestion));
  const accepted = new Set(history.filter((e) => e.action === "accept").map((e) => e.suggestion));
  const open = order.filter((id) => !dismissed.has(id));
  const candidates = open.length ? open : order;
  return candidates.find((id) => accepted.has(id)) ?? candidates[0];
}

/** Only a confident HSHA estimate counts as agreeing evidence; uncertain or missing evidence is never leaned on. */
function estimateAgrees(estimate: EstimateView): boolean {
  return estimate.kind === "estimate" && estimate.certainty === "confident" && estimate.profile === "HSHA";
}

export function chooseResponse({ estimate, checkIn, correction, history }: ResponseInput): ResponseDecision {
  // A correction speaks over everything else: the student knows their situation better than the replayed day.
  if (correction === "fine") return { kind: "silent", reason: "flow" };
  if (correction === "other") return { kind: "support" };
  if (correction === "more") return { kind: "offer", suggestion: pick(MORE_ORDER, history), basis: "correction" };

  switch (checkIn) {
    // Comfortable and focused preserves flow, even against an elevated estimate (§7 row 2).
    case "focused":
      return { kind: "silent", reason: "flow" };
    // Declined in any form: continue, and never repeat the prompt (§7 row 5).
    case "skipped":
    case "dismissed":
    case "no_response":
      return { kind: "silent", reason: "declined" };
    // Not asked, or opted out of check-ins: an estimate on its own never interrupts. Uncertain or contradictory
    // evidence calls for clarifying, deferring or abstaining (§7 row 3); abstaining is the least intrusive, so
    // "ask a clarifying question" is not reached by these rules.
    case "unasked":
      return { kind: "silent", reason: "abstain" };
    // A hand was asked for: support is offered whatever the profile, including none (§7 row 4).
    // LSLA, LSHA and HSLA have no specific rules yet (§14.4), so they take this generic path.
    case "swamped":
      return {
        kind: "offer",
        suggestion: pick(HAND_ORDER, history),
        basis: estimateAgrees(estimate) ? "check-in+estimate" : "check-in",
      };
  }
}
