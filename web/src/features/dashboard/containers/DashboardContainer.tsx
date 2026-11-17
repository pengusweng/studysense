"use client";

import { useEffect, useRef, useState } from "react";
import { Sheet } from "@/components/molecules/Sheet";
import { Toast } from "@/components/molecules/Toast";
import { takeFlash } from "@/lib/flash";
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
  // A confirmation from the page just left (setup), shown once.
  const [flash, setFlashMessage] = useState("");
  useEffect(() => {
    // Taking the message clears it, so a repeated effect run finds nothing; keep what the first run found.
    const message = takeFlash();
    if (message) setFlashMessage(message);
  }, []);

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
      {flash && <Toast message={flash} onClose={() => setFlashMessage("")} />}
    </Sheet>
  );
}
