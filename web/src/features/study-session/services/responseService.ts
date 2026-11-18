import type { CheckInState } from "@/lib/checkIn";
import type { Correction, FeedbackEntry } from "@/lib/feedback";
import { http } from "@/lib/http";
import type { SupportId } from "@/lib/supportOptions";
import type { EstimateView } from "../types";
import { fallbackResponse } from "./responseFallback";

/**
 * The rule-based response (docs/AGENTS.md §7), decided by the API (api/rules.py, §14.5). Least intrusive by
 * default: nothing is offered unless the student asked for a hand, in the check-in or in a correction.
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

/** Asks the API for the response. When it can't be reached, help asked for still opens the support list (§2 rule 8). */
export async function getResponse({ estimate, checkIn, correction, history }: ResponseInput): Promise<ResponseDecision> {
  try {
    return await http<ResponseDecision>("/response", {
      method: "POST",
      body: JSON.stringify({ estimate, check_in: checkIn, correction: correction ?? null, history }),
    });
  } catch {
    return fallbackResponse(checkIn, correction);
  }
}
