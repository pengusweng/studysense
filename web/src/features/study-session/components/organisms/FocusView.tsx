"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import { useCheckInDue } from "@/lib/checkIn";
import type { EstimateView } from "../../types";
import { CheckIn, type CheckInHandle } from "./CheckIn";
import styles from "./FocusView.module.css";

type Props = {
  phase: "active" | "paused";
  /** The day's estimate, passed on to the check-in's response rules. */
  estimate: EstimateView;
  /** Move focus to the main control when this view was reached by the student's own action. */
  takeFocus: boolean;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
};

const COPY = {
  active: { title: "Studying.", note: "nothing needs you right now", status: "Session in progress" },
  paused: { title: "Paused.", note: "your place is kept", status: "Session paused" },
};

/**
 * The session itself, full screen: one word, a hand note, and the controls over the drifting ruling.
 * The demo source was footnoted before Start, so nothing here competes with the word.
 */
export function FocusView({ phase, estimate, takeFocus, onPause, onResume, onEnd }: Props) {
  const main = useRef<HTMLButtonElement>(null);
  const checkIn = useRef<CheckInHandle>(null);
  const copy = COPY[phase];
  const due = useCheckInDue();
  // Read when the phase changes, not tracked: answering must not pull focus back to the controls by itself.
  const dueNow = useRef(due);
  useEffect(() => {
    dueNow.current = due;
  });

  useEffect(() => {
    if (!takeFocus) return;
    // On the first pause the optional question takes focus, so a screen reader hears it; Resume is a Tab away.
    if (phase === "paused" && dueNow.current) checkIn.current?.focus();
    else main.current?.focus();
  }, [phase, takeFocus]);

  return (
    <div className={styles.view} data-phase={phase}>
      <span className={styles.margin} aria-hidden="true" />
      <div className={styles.top}>
        <HelpCorner />
      </div>

      <div className={styles.center} key={phase}>
        <h1 className={styles.title}>
          {copy.title}
          {phase === "active" && (
            <svg className={styles.underline} viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden="true">
              <path pathLength={1} d="M3 11 C 42 7, 92 13, 142 9 S 232 5, 297 8" />
            </svg>
          )}
        </h1>
        <p className={styles.note}>{copy.note}</p>
        {phase === "paused" && <CheckIn ref={checkIn} due={due} estimate={estimate} onSettled={() => main.current?.focus()} />}
      </div>

      <div className={styles.controls}>
        <p className={styles.status}>
          <span className={styles.dot} aria-hidden="true" />
          {copy.status}
        </p>
        {phase === "active" ? (
          <Button ref={main} variant="secondary" onClick={onPause}>
            Pause
          </Button>
        ) : (
          <Button ref={main} onClick={onResume}>
            Resume
          </Button>
        )}
        <TextButton onClick={onEnd}>End session</TextButton>
      </div>
    </div>
  );
}
