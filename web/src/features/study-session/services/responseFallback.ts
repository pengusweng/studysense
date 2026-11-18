import type { CheckInState } from "../../../lib/checkIn";
import type { Correction } from "../../../lib/feedback";
import type { ResponseDecision } from "./responseService";

/**
 * What the session does when the API can't decide: a student who asked for a hand still gets the whole support
 * list (docs/AGENTS.md §2 rule 8), and everything else stays quiet. Only type imports, so `npm test` runs it with
 * plain Node.
 */
export function fallbackResponse(checkIn: CheckInState, correction?: Correction): ResponseDecision {
  if (correction === "fine") return { kind: "silent", reason: "flow" };
  if (correction || checkIn === "swamped") return { kind: "support" };
  if (checkIn === "focused") return { kind: "silent", reason: "flow" };
  if (checkIn === "unasked") return { kind: "silent", reason: "abstain" };
  return { kind: "silent", reason: "declined" };
}
