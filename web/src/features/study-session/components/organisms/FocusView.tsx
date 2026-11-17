"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import styles from "./FocusView.module.css";

type Props = {
  phase: "active" | "paused";
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
export function FocusView({ phase, takeFocus, onPause, onResume, onEnd }: Props) {
  const main = useRef<HTMLButtonElement>(null);
  const copy = COPY[phase];

  useEffect(() => {
    if (takeFocus) main.current?.focus();
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
