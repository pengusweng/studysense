"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/molecules/Sheet";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import { clearSetupDraft, setConsent, useKnownConsent, type CheckInsChoice } from "@/lib/consent";
import { setPreferences, useKnownPreferences } from "@/lib/preferences";
import { sessionStorageAvailable } from "@/lib/sessionValue";
import { clearVisit } from "@/lib/visit";
import type { Saved } from "../components/atoms/SavedLine";
import { CheckInsSection } from "../components/organisms/CheckInsSection";
import { EstimateSection } from "../components/organisms/EstimateSection";
import { PrivacySection } from "../components/organisms/PrivacySection";
import styles from "./PreferencesContainer.module.css";

type SectionId = "checkIns" | "estimate";

/**
 * Preferences (issue #7): check-ins and when they may ask, whether the estimate shows, and what this visit keeps.
 * Every change applies at once and says so beside the section that changed. Nothing here shows a stored value.
 */
export function PreferencesContainer() {
  const consent = useKnownConsent();
  const prefs = useKnownPreferences();
  const [storageOk, setStorageOk] = useState(true);
  const [saved, setSaved] = useState<{ section: SectionId; tick: number } | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => setStorageOk(sessionStorageAvailable()), []);

  const savedText = storageOk ? "Saved for this visit." : "Lasts for this page only.";
  const savedFor = (section: SectionId): Saved =>
    saved?.section === section ? { text: savedText, tick: saved.tick } : null;

  function changed(section: SectionId) {
    setCleared(false);
    setSaved((s) => ({ section, tick: (s?.tick ?? 0) + 1 }));
  }

  const known = consent !== null && prefs !== null;
  const checkIns: CheckInsChoice | null = consent && consent !== "undecided" ? consent.checkIns : null;

  return (
    <Sheet>
      <div className={styles.page}>
        <h1 className={styles.title}>Preferences</h1>
        <p className={styles.lede}>
          {storageOk
            ? "Changes apply straight away and last for this visit."
            : "Changes apply straight away, but your browser won’t let them be kept, so they last for this page only."}
        </p>

        {/* Until the browser's values are known the sections hold their place, so no default flashes. */}
        {known ? (
          <>
            <CheckInsSection
              checkIns={checkIns}
              askWhen={prefs.askWhen}
              onCheckIns={(value) => {
                // The same choice as setup, so making it here also finishes setup.
                setConsent({ checkIns: value });
                clearSetupDraft();
                changed("checkIns");
              }}
              onAskWhen={(askWhen) => {
                setPreferences({ askWhen });
                changed("checkIns");
              }}
              saved={savedFor("checkIns")}
            />
            <EstimateSection
              showEstimate={prefs.showEstimate}
              onChange={(showEstimate) => {
                setPreferences({ showEstimate });
                changed("estimate");
              }}
              saved={savedFor("estimate")}
            />
            <PrivacySection
              storageOk={storageOk}
              cleared={cleared}
              onClear={() => {
                clearVisit();
                setSaved(null);
                setCleared(true);
              }}
            />
          </>
        ) : (
          <div className={styles.slot} aria-hidden="true" />
        )}

        <div className={styles.help}>
          <HelpCorner align="start" />
        </div>
      </div>
    </Sheet>
  );
}
