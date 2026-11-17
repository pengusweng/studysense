"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Spread } from "@/components/molecules/Spread";
import { clearSetupDraft, setConsent, useKnownConsent, useSetupDraft, type CheckInsChoice } from "@/lib/consent";
import { sessionStorageAvailable } from "@/lib/sessionValue";
import { useDemoRecord } from "@/lib/useDemoRecord";
import { UsedPage } from "../components/organisms/UsedPage";
import { ChoicePage } from "../components/organisms/ChoicePage";
import styles from "../components/organisms/SetupPages.module.css";

const noSubscribe = () => () => {};

/**
 * Consent and setup (issue #3): one notebook spread. The left page says, in the instrument's voice, what the
 * demo works from; the right page holds the student's one choice. Reached from the Dashboard's "Get started"
 * on a first visit, and reopened later from "What StudySense uses".
 */
export function SetupContainer() {
  const router = useRouter();
  const consent = useKnownConsent();
  const [draft, setDraft] = useSetupDraft();
  const { record, check } = useDemoRecord();
  const storageOk = useSyncExternalStore(noSubscribe, sessionStorageAvailable, () => true);

  const decided = consent !== null && consent !== "undecided";
  const value: CheckInsChoice | null = draft !== "none" ? draft : decided ? consent.checkIns : null;

  function confirm() {
    if (!value) return;
    setConsent({ checkIns: value });
    clearSetupDraft();
    router.push("/dashboard");
  }

  // Back leaves without saving: to the landing page on a first visit, or to the Dashboard when reopened.
  function back() {
    clearSetupDraft();
    router.push(decided ? "/dashboard" : "/");
  }

  return (
    <Spread
      intro
      className={styles.spread}
      labelledBy="setup-title"
      folio={1}
      left={<UsedPage record={record} check={check} />}
      right={
        <ChoicePage
          value={value}
          onChange={setDraft}
          onConfirm={confirm}
          onBack={back}
          reopened={decided}
          storageOk={storageOk}
        />
      }
    />
  );
}
