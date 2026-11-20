import type { CheckInState } from "@/lib/checkIn";
import type { Correction, FeedbackEntry } from "@/lib/feedback";
import { http } from "@/lib/http";
import type { SupportId } from "@/lib/supportOptions";
import type { AcademicNeed } from "@/lib/academicSupport";
import type { EstimateView } from "../types";
import { fallbackResponse } from "./responseFallback";

/** Historical estimates cannot be used to justify current-student support. */
export type ResponseDecision =
  | { kind: "silent"; reason: "flow" | "declined" | "abstain" }
  | { kind: "offer"; suggestion: SupportId; basis: "check-in" | "correction" }
  | { kind: "support"; category?: AcademicNeed | null };

export type ResponseInput = {
  estimate: EstimateView;
  checkIn: CheckInState;
  correction?: Correction;
  academicNeed?: AcademicNeed;
  history: FeedbackEntry[];
};

/** API outages preserve access to support without fabricating an estimate. */
export async function getResponse({ estimate, checkIn, correction, academicNeed, history }: ResponseInput): Promise<ResponseDecision> {
  try {
    return await http<ResponseDecision>("/response", {
      method: "POST",
      body: JSON.stringify({ estimate, check_in: checkIn, correction: correction ?? null, academic_need: academicNeed ?? null, history }),
    });
  } catch {
    return fallbackResponse(checkIn, correction);
  }
}
