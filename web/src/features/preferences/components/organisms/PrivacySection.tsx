"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { LogTable, type LogRow } from "@/components/molecules/LogTable";
import styles from "./Preferences.module.css";

/** Kinds of thing kept, never their values (docs/AGENTS.md §6: no feedback history or sensitive values shown). */
const KEPT: LogRow[] = [
  { label: "Setup choice", value: "whether check-ins may happen" },
  { label: "Preferences", value: "the choices on this page" },
  { label: "Check-in", value: "this session’s answer, if any" },
  { label: "Feedback", value: "what you did with each suggestion" },
  { label: "Demo record", value: "the replayed day you chose" },
];

type Props = {
  storageOk: boolean;
  /** True right after clearing, until something changes again. */
  cleared: boolean;
  onClear: () => void;
};

/** What this visit keeps, said plainly, and one way to clear it all. */
export function PrivacySection({ storageOk, cleared, onClear }: Props) {
  const [confirming, setConfirming] = useState(false);
  const confirmBox = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const done = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (confirming) confirmBox.current?.focus();
  }, [confirming]);

  useEffect(() => {
    if (cleared) done.current?.focus();
  }, [cleared]);

  function cancel() {
    setConfirming(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  return (
    <section className={styles.section} aria-labelledby="prefs-privacy">
      <h2 id="prefs-privacy" className={styles.heading}>
        Privacy
      </h2>
      <p className={styles.prose}>
        {storageOk
          ? "This visit keeps a few things in this browser tab, so the demo can follow your choices. Nothing is sent anywhere, and it all goes when you close the tab."
          : "Your browser isn’t letting StudySense keep anything, so your choices last for this page only. Nothing is sent anywhere."}
      </p>
      <LogTable rows={KEPT} label="What this visit keeps" />

      {confirming ? (
        <div
          ref={confirmBox}
          className={styles.confirm}
          tabIndex={-1}
          role="group"
          aria-labelledby="prefs-clear-text"
          onKeyDown={(e) => e.key === "Escape" && cancel()}
        >
          <p id="prefs-clear-text">
            This clears your choices, check-in answers and feedback, and ends any session in progress. Setup will be
            offered again.
          </p>
          <div className={styles.actions}>
            <Button
              variant="secondary"
              onClick={() => {
                setConfirming(false);
                onClear();
              }}
            >
              Clear
            </Button>
            <TextButton onClick={cancel}>Cancel</TextButton>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button ref={trigger} variant="secondary" onClick={() => setConfirming(true)}>
            Clear what this visit kept
          </Button>
        </div>
      )}

      <p ref={done} className={styles.cleared} role="status" tabIndex={-1}>
        {cleared && "Cleared. Setup will be offered again on the Dashboard."}
      </p>
    </section>
  );
}
