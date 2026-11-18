"use client";

import { Button } from "@/components/atoms/Button";
import type { DemoRecord } from "@/lib/demoRecord";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import { DemoSourceNote } from "./DemoSourceNote";
import { EstimateNote } from "./EstimateNote";
import type { DemoDays, EstimateView, RecordCheck } from "../../types";
import styles from "./PhaseView.module.css";

type Props = {
  record: DemoRecord;
  check: RecordCheck;
  days: DemoDays | null;
  /** Null when the student chose to hide the estimate in Preferences. */
  estimate: EstimateView | null;
  onChoose: (record: DemoRecord) => void;
  onStart: () => void;
};

/** Before a session: one action, with what will be replayed footnoted beneath it. */
export function ReadyView({ record, check, days, estimate, onChoose, onStart }: Props) {
  return (
    <div className={styles.phase}>
      <div className={styles.body}>
        <h1 className={styles.title}>Ready to study.</h1>
        <p className={styles.lede}>Nothing runs until you start. You can pause or end at any time.</p>
        {estimate && (
          <div className={styles.estimate}>
            <EstimateNote view={estimate} />
          </div>
        )}
        <Button className={styles.primary} onClick={onStart}>
          Start studying
        </Button>
        <HelpCorner />
        <DemoSourceNote record={record} check={check} days={days} onChoose={onChoose} />
      </div>
    </div>
  );
}
