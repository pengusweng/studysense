"use client";

import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { AnswerList } from "@/components/molecules/AnswerList";
import type { Correction } from "@/lib/feedback";
import { supportOption, type SupportId } from "@/lib/supportOptions";
import type { ResponseDecision } from "../../services/responseRules";
import styles from "./ResponseNote.module.css";

type Offer = Extract<ResponseDecision, { kind: "offer" }>;

const LEAD: Record<Offer["basis"], string> = {
  "check-in": "You said a hand would help.",
  "check-in+estimate": "You said a hand would help, and the replayed day may point the same way.",
  correction: "Thanks, that’s noted. This may suit better.",
};

/** What the student can say instead, in their own words. Never a profile, never a score. */
const CORRECTIONS: { id: Correction; label: string }[] = [
  { id: "fine", label: "I’m fine, just busy." },
  { id: "more", label: "It’s more than this." },
  { id: "other", label: "Something else is going on." },
];

type Props = {
  offer: Offer;
  /** Only one correction per suggestion, so correcting can't loop. */
  canCorrect: boolean;
  /** Set while the note folds shut, so nothing can be pressed twice. */
  disabled?: boolean;
  onAccept: (suggestion: SupportId) => void;
  onDismiss: (suggestion: SupportId) => void;
  onCorrect: (suggestion: SupportId, correction: Correction) => void;
  onOtherOptions: () => void;
};

/**
 * One rule-picked suggestion (issue #7), with Accept, Dismiss and Correct. Written on the same ruled paper as the
 * check-in it answers: StudySense's voice in print and Pencil; only the student's own pick is circled in Iris.
 */
export const ResponseNote = forwardRef<HTMLElement, Props>(function ResponseNote(
  { offer, canCorrect, disabled = false, onAccept, onDismiss, onCorrect, onOtherOptions },
  ref,
) {
  const id = useId();
  const option = supportOption(offer.suggestion);
  const [correcting, setCorrecting] = useState(false);
  const [fix, setFix] = useState<Correction | null>(null);
  const correctBox = useRef<HTMLDivElement>(null);
  const correctTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (correcting) correctBox.current?.focus();
  }, [correcting]);

  function cancelCorrecting() {
    setCorrecting(false);
    setFix(null);
    // The trigger is back once the list closes; focus it on the next frame.
    requestAnimationFrame(() => correctTrigger.current?.focus());
  }

  return (
    <section
      ref={ref}
      className={styles.response}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-lead`}
      onKeyDown={(e) => {
        if (e.key !== "Escape" || disabled) return;
        e.stopPropagation();
        if (correcting) cancelCorrecting();
        else onDismiss(offer.suggestion);
      }}
    >
      <p id={`${id}-lead`} className={styles.lead}>
        {LEAD[offer.basis]}
      </p>
      <h2 id={`${id}-title`} className={styles.suggestion}>
        {option.label}
      </h2>
      <p className={styles.detail}>{option.response}</p>

      {correcting ? (
        <div ref={correctBox} className={styles.correct} tabIndex={-1} role="group" aria-label="Correct the suggestion">
          <AnswerList
            question="What fits better?"
            hint="StudySense uses this to choose what it offers next. Nothing else changes."
            options={CORRECTIONS}
            value={fix}
            onChange={setFix}
          />
          <div className={styles.actions}>
            <Button
              variant="secondary"
              disabled={!fix || disabled}
              aria-describedby={fix ? undefined : `${id}-reason`}
              onClick={() => fix && onCorrect(offer.suggestion, fix)}
            >
              Update
            </Button>
            <TextButton onClick={cancelCorrecting} disabled={disabled}>
              Cancel
            </TextButton>
          </div>
          <p id={`${id}-reason`} className={styles.reason} data-hidden={fix ? true : undefined} aria-hidden={fix ? true : undefined}>
            Pick what fits, or cancel.
          </p>
        </div>
      ) : (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => onAccept(offer.suggestion)} disabled={disabled}>
            Accept
          </Button>
          <TextButton onClick={() => onDismiss(offer.suggestion)} disabled={disabled}>
            Dismiss
          </TextButton>
          {canCorrect && (
            <TextButton ref={correctTrigger} onClick={() => setCorrecting(true)} disabled={disabled}>
              That’s not it
            </TextButton>
          )}
        </div>
      )}

      <p className={styles.more}>
        Something else?{" "}
        <TextButton onClick={onOtherOptions} disabled={disabled}>
          See all options
        </TextButton>
      </p>
    </section>
  );
});
