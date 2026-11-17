"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { AnswerList } from "@/components/molecules/AnswerList";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import { recordCheckIn, type CheckInOutcome } from "@/lib/checkIn";
import styles from "./CheckIn.module.css";

type Answer = "focused" | "swamped";

/** The same two answers as the landing page's check-in; skipping is its own action here. */
const ANSWERS: { id: Answer; label: string }[] = [
  { id: "focused", label: "Focused. Leave me be." },
  { id: "swamped", label: "Swamped. A hand would help." },
];

/** Matches the fold transition in CheckIn.module.css. */
const FOLD_MS = 420;

type Step = "question" | "noted" | "support" | "help" | "closed";

type Props = {
  /** The question is still due this session (opted in, not yet asked). */
  due: boolean;
  /** Called when the check-in is finished and focus should return to the session's controls. */
  onSettled: () => void;
};

export type CheckInHandle = { focus: () => void };

function motionOn() {
  return document.documentElement.dataset.motion === "on";
}

/**
 * The session's one optional question (issue #5), unfolded in place under "Paused." on the first pause.
 * Every way out is a defined state: an answer, skip, not now, or simply resuming (no response).
 */
export const CheckIn = forwardRef<CheckInHandle, Props>(function CheckIn({ due, onSettled }, ref) {
  const id = useId();
  const [step, setStep] = useState<Step>("question");
  const [folding, setFolding] = useState(false);
  const [pick, setPick] = useState<Answer | null>(null);
  const question = useRef<HTMLElement>(null);
  const support = useRef<HTMLElement>(null);
  const returning = useRef(false);
  const foldTimer = useRef<number | undefined>(undefined);

  useImperativeHandle(ref, () => ({ focus: () => question.current?.focus() }), []);

  useEffect(() => () => window.clearTimeout(foldTimer.current), []);

  useEffect(() => {
    if (step === "support" || step === "help") support.current?.focus();
    if (step === "question" && returning.current) {
      returning.current = false;
      question.current?.focus();
    }
  }, [step]);

  /** Fold the current panel shut, so "Paused." eases back down instead of jumping, then show what follows. */
  function foldTo(next: Step) {
    onSettled();
    if (!motionOn()) return setStep(next);
    setFolding(true);
    foldTimer.current = window.setTimeout(() => {
      setFolding(false);
      setStep(next);
    }, FOLD_MS);
  }

  function settle(outcome: Exclude<CheckInOutcome, "no_response">) {
    // Recorded at once, so resuming mid-fold can't count as no response.
    recordCheckIn(outcome);
    if (outcome === "swamped") setStep("support");
    else foldTo(outcome === "focused" ? "noted" : "closed");
  }

  if (step === "noted") {
    return (
      <p className={styles.noted} role="status">
        Noted. StudySense will stay quiet for the rest of this session.
      </p>
    );
  }

  if (step === "support" || step === "help") {
    return (
      <div className={styles.fold} data-folding={folding || undefined}>
        <div className={styles.support}>
          {step === "support" && <p className={styles.intro}>Here are a few things that might help.</p>}
          <SupportPanel
            ref={support}
            id={`${id}-support`}
            onClose={() => {
              // Help asked before answering leaves the question open; after "Swamped" the check-in is done.
              if (step === "help") {
                returning.current = true;
                setStep("question");
              } else {
                foldTo("closed");
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (step === "closed" || (!due && !folding)) return null;

  return (
    <div className={styles.fold} data-folding={folding || undefined}>
      <section
        ref={question}
        className={styles.checkIn}
        tabIndex={-1}
        aria-label="Optional check-in"
        onKeyDown={(e) => {
          if (e.key !== "Escape" || folding) return;
          e.stopPropagation();
          settle("dismissed");
        }}
      >
        <AnswerList
          question="How is studying going?"
          hint="Optional. Kept for this visit only, apart from the replayed data."
          options={ANSWERS}
          value={pick}
          onChange={setPick}
        />
        <div className={styles.actions}>
          <Button
            variant="secondary"
            disabled={!pick || folding}
            aria-describedby={pick ? undefined : `${id}-reason`}
            onClick={() => pick && settle(pick)}
          >
            Answer
          </Button>
          <TextButton onClick={() => settle("skipped")} disabled={folding}>
            Skip this question
          </TextButton>
        </div>
        {/* Kept in place once answered, so picking doesn't shift the page. */}
        <p id={`${id}-reason`} className={styles.reason} data-hidden={pick ? true : undefined} aria-hidden={pick ? true : undefined}>
          Pick an answer, or skip it.
        </p>
        <p className={styles.help}>
          Rather have support now?{" "}
          <TextButton onClick={() => setStep("help")} disabled={folding}>
            Ask for help
          </TextButton>
        </p>
        {/* Last in reading order, so the question comes first; shown at the top corner, where a note is set aside. */}
        <TextButton className={styles.dismiss} onClick={() => settle("dismissed")} disabled={folding}>
          Not now
        </TextButton>
      </section>
    </div>
  );
});
