"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/atoms/ButtonLink";
import { TextButton } from "@/components/atoms/TextButton";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import { setSessionStatus, type SessionStatus } from "@/lib/sessionStatus";
import styles from "./StudyStart.module.css";

const STATUS_LINE: Record<SessionStatus, string | null> = {
  none: null,
  active: "A session is in progress.",
  paused: "Session paused. Pick up where you left off.",
  ended: "Last session ended. Start another when you like.",
};

type Props = {
  status: SessionStatus;
  /** Whether consent and setup is finished; null until the browser's value is known. */
  setupDone: boolean | null;
  /** Present only while "How a session goes" is hidden; reopens it. */
  onShowHowItWorks?: () => void;
  reopenRef?: RefObject<HTMLButtonElement | null>;
};

/** The page's one job: start or resume a study session. Help sits one quiet line below it. */
export function StudyStart({ status, setupDone, onShowHowItWorks, reopenRef }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (helpOpen) panel.current?.focus();
  }, [helpOpen]);

  const line = STATUS_LINE[status];
  const resuming = status === "active" || status === "paused";

  return (
    <section className={styles.start} aria-labelledby="dashboard-title">
      <h1 id="dashboard-title" className={styles.title}>
        Ready when you are.
      </h1>
      {/* First visit: setup comes before the first session (issue #3). Until the choice is known the slot
          holds its height, so neither label flashes. */}
      {setupDone === null && <span className={styles.slot} aria-hidden="true" />}
      {setupDone === false && (
        <ButtonLink href="/setup" className={styles.primary}>
          Get started
        </ButtonLink>
      )}
      {/* Pressing start begins the session itself; the Study Session opens already running. */}
      {setupDone && (
        <ButtonLink href="/study-session" className={styles.primary} onClick={() => setSessionStatus("active")}>
          {resuming ? "Resume session" : "Start a study session"}
        </ButtonLink>
      )}
      {setupDone && line && <p className={styles.status}>{line}</p>}
      <p className={styles.help}>
        Need help now?{" "}
        <TextButton
          ref={helpBtn}
          aria-expanded={helpOpen}
          aria-controls="dashboard-support"
          onClick={() => setHelpOpen((o) => !o)}
        >
          Ask for support.
        </TextButton>
      </p>
      {helpOpen && (
        <SupportPanel
          ref={panel}
          id="dashboard-support"
          onClose={() => {
            setHelpOpen(false);
            helpBtn.current?.focus();
          }}
        />
      )}
      {onShowHowItWorks && (
        <p className={styles.reopen}>
          <TextButton ref={reopenRef} onClick={onShowHowItWorks}>
            How a session goes
          </TextButton>
        </p>
      )}
      {setupDone && (
        <p className={styles.reopen}>
          <Link href="/setup">What StudySense uses</Link>
        </p>
      )}
    </section>
  );
}
