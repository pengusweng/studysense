"use client";

import { useState } from "react";
import { IDLE_OUTCOME, OUTCOMES } from "../content";
import type { CheckInAnswer } from "../types";

/** State for the illustrative check-in on the landing page. Nothing is sent anywhere. */
export function useCheckIn() {
  const [answer, setAnswer] = useState<CheckInAnswer | null>(null);
  const outcome = answer ? OUTCOMES[answer] : IDLE_OUTCOME;

  return { answer, outcome, setAnswer, reset: () => setAnswer(null) };
}
