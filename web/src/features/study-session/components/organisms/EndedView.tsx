"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { HelpCorner } from "../molecules/HelpCorner";
import styles from "./PhaseView.module.css";

/** After a session: a plain close, no celebration (docs/AGENTS.md §2 rule 7). */
export function EndedView({ takeFocus, onStartAnother }: { takeFocus: boolean; onStartAnother: () => void }) {
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
      </div>
    </div>
  );
}
