"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet } from "@/components/molecules/Sheet";
import { VisuallyHidden } from "@/components/atoms/VisuallyHidden";
import { setSessionStatus, useKnownSessionStatus, type SessionStatus } from "@/lib/sessionStatus";
import { useDemoRecord } from "../hooks/useDemoRecord";
import { TideField } from "../components/atoms/TideField";
import { ReadyView } from "../components/organisms/ReadyView";
import { FocusView } from "../components/organisms/FocusView";
import { EndedView } from "../components/organisms/EndedView";
import type { SessionPhase } from "../types";
import styles from "./StudySessionContainer.module.css";

const PHASE: Record<SessionStatus, SessionPhase> = { none: "ready", active: "active", paused: "paused", ended: "ended" };

const ANNOUNCE: Record<SessionPhase, string> = {
  ready: "",
  active: "Session started.",
  paused: "Session paused.",
  ended: "Session ended.",
};

const TAB_TITLE: Record<SessionPhase, string> = {
  ready: "Study Session · StudySense",
  active: "Studying · StudySense",
  paused: "Paused · StudySense",
  ended: "Study Session · StudySense",
};

/**
 * Study Session, focus mode: ready → active ⇄ paused → ended (docs/AGENTS.md §6).
 * No timer and no numbers: the drifting ruling and one word say a session is running.
 */
export function StudySessionContainer() {
  const status = useKnownSessionStatus();
  const { record, days, check, choose } = useDemoRecord();
  const [moved, setMoved] = useState(false);
  const announce = useRef<string>("");

  const phase = status === null ? null : PHASE[status];

  // The tab says so too, visible from any other window. Next applies page metadata after hydration,
  // so the title is re-asserted whenever the head changes while this screen is open.
  useEffect(() => {
    if (!phase) return;
    const want = TAB_TITLE[phase];
    const apply = () => {
      if (document.title !== want) document.title = want;
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [phase]);

  function go(next: SessionStatus) {
    setMoved(true);
    announce.current = ANNOUNCE[PHASE[next]];
    setSessionStatus(next);
  }

  return (
    <Sheet className={styles.sheet}>
      <TideField phase={phase ?? "ready"} />
      <VisuallyHidden>
        <span role="status">{announce.current}</span>
      </VisuallyHidden>
      {phase === "ready" && (
        <ReadyView record={record} check={check} days={days} onChoose={choose} onStart={() => go("active")} />
      )}
      {(phase === "active" || phase === "paused") && (
        <FocusView
          phase={phase}
          record={record}
          takeFocus={moved}
          onPause={() => go("paused")}
          onResume={() => go("active")}
          onEnd={() => go("ended")}
        />
      )}
      {phase === "ended" && (
        <EndedView
          record={record}
          check={check}
          days={days}
          onChoose={choose}
          takeFocus={moved}
          onStartAnother={() => go("active")}
        />
      )}
    </Sheet>
  );
}
