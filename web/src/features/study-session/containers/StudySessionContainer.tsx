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

/** Matches --proposal-dur-chrome: how long the chrome takes to return once a session ends. */
const CHROME_MS = 760;
let chromeTimer: number | undefined;

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

  // Studying takes the whole window: the app chrome steps away while a session is active or paused.
  const focused = phase === "active" || phase === "paused";
  // Leaving (End, or navigating away) passes through "leaving" while the chrome eases back in.
  useEffect(() => {
    if (!focused) return;
    const root = document.documentElement;
    window.clearTimeout(chromeTimer);
    root.dataset.session = "focus";
    return () => {
      root.dataset.session = "leaving";
      chromeTimer = window.setTimeout(() => {
        if (root.dataset.session === "leaving") delete root.dataset.session;
      }, CHROME_MS);
    };
  }, [focused]);

  function go(next: SessionStatus) {
    // Starting from further down the page (a demo panel open): rise to the top as the sheet grows.
    if (next === "active" && window.scrollY > 0) window.scrollTo({ top: 0 });
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
      {focused && (
        <FocusView
          phase={phase}
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
