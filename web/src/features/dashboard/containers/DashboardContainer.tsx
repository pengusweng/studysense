"use client";

import { useEffect, useRef } from "react";
import { Sheet } from "@/components/molecules/Sheet";
import { useKnownConsent } from "@/lib/consent";
import { useSessionStatusValue } from "@/lib/sessionStatus";
import { useHowItWorks } from "../hooks/useHowItWorks";
import { StudyStart } from "../components/organisms/StudyStart";
import { HowItWorks } from "../components/organisms/HowItWorks";

/**
 * Dashboard: one action, start or resume a study session (docs/dashboard-plan.md).
 * The demo source is disclosed inside the Study Session, before anything is replayed.
 */
export function DashboardContainer() {
  const [status] = useSessionStatusValue();
  const consent = useKnownConsent();
  const how = useHowItWorks();

  // Hiding or reopening "How a session goes" unmounts the control that was clicked, so focus moves to its counterpart.
  const reopenRef = useRef<HTMLButtonElement>(null);
  const howRef = useRef<HTMLElement>(null);
  const toggledByUser = useRef(false);
  useEffect(() => {
    if (!toggledByUser.current) return;
    toggledByUser.current = false;
    (how.hidden ? reopenRef.current : howRef.current)?.focus();
  }, [how.hidden]);

  function setHowHidden(next: boolean) {
    toggledByUser.current = true;
    how.setHidden(next);
  }

  return (
    <Sheet>
      <StudyStart
        status={status}
        setupDone={consent === null ? null : consent !== "undecided"}
        onShowHowItWorks={how.hidden ? () => setHowHidden(false) : undefined}
        reopenRef={reopenRef}
      />
      {how.hidden === false && <HowItWorks sectionRef={howRef} onHide={() => setHowHidden(true)} />}
    </Sheet>
  );
}
