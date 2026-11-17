"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
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
  takeFocus: boolean;
  onStartAnother: () => void;
};

/**
 * After a session: a plain close, no celebration (docs/AGENTS.md §2 rule 7). The demo note returns here,
 * so the record can be explained or changed before the next session starts.
 */
export function EndedView({ record, check, days, onChoose, takeFocus, onStartAnother }: Props) {
  const main = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (takeFocus) main.current?.focus();
  }, [takeFocus]);

  return (
    <div className={styles.phase}>
      <div className={styles.body}>
        <h1 className={styles.title}>Session ended.</h1>
        <p className={styles.lede}>Start another when you like.</p>
        <Button ref={main} className={styles.primary} onClick={onStartAnother}>
          Start another session
        </Button>
        <p className={styles.links}>
          <Link href="/dashboard">Back to the Dashboard</Link>
        </p>
        <HelpCorner />
        <DemoSourceNote record={record} check={check} days={days} onChoose={onChoose} />
      </div>
    </div>
  );
}
