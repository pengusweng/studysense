"use client";

import { Button } from "@/components/atoms/Button";
import type { DemoRecord } from "@/lib/demoRecord";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import { DemoSourceNote } from "./DemoSourceNote";
import type { DemoDays, RecordCheck } from "../../types";
import styles from "./PhaseView.module.css";

type Props = {
  record: DemoRecord;
  check: RecordCheck;
  days: DemoDays | null;
  onChoose: (record: DemoRecord) => void;
  onStart: () => void;
};

/** Before a session: one action, with what will be replayed footnoted beneath it. */
export function ReadyView({ record, check, days, onChoose, onStart }: Props) {
  return (
    <div className={styles.phase}>
      <div className={styles.body}>
        <h1 className={styles.title}>Ready to study.</h1>
        <p className={styles.lede}>Nothing runs until you start. You can pause or end at any time.</p>
        {check === "unavailable" && (
          <p className={styles.lede}>This demo record can&rsquo;t be replayed. You can still study; no estimate will be shown.</p>
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
