"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { formatParticipant, formatRecordDate, type DemoRecord } from "@/lib/demoRecord";
import { HelpCorner } from "../molecules/HelpCorner";
import styles from "./FocusView.module.css";

type Props = {
  phase: "active" | "paused";
  record: DemoRecord;
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

/** The session itself: one word, a hand note, and the controls, set over the drifting ruling. */
export function FocusView({ phase, record, takeFocus, onPause, onResume, onEnd }: Props) {
  const main = useRef<HTMLButtonElement>(null);
  const copy = COPY[phase];

  useEffect(() => {
    if (takeFocus) main.current?.focus();
  }, [phase, takeFocus]);

  return (
    <div className={styles.view} data-phase={phase}>
      <div className={styles.top}>
        <p className={styles.source}>
          Replaying SSAQS {formatParticipant(record.participant)} · {formatRecordDate(record.date)} · demo, not live
        </p>
        <HelpCorner />
      </div>

      <div className={styles.center} key={phase}>
        <h1 className={styles.title}>{copy.title}</h1>
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
