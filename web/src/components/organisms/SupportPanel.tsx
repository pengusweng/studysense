"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { ACADEMIC_NEEDS, CLARIFIERS, FOLLOWUPS, strategiesFor, type AcademicNeed } from "@/lib/academicSupport";
import { SUPPORT_OPTIONS } from "@/lib/supportOptions";
import styles from "./SupportPanel.module.css";

type Props = { id: string; onClose: () => void; initialCategory?: AcademicNeed | null };
type Stage = "start" | "clarify" | "followup" | "strategies" | "general";

/** Voluntary, finite Task 4 academic-support flow; never classifies student emotion. */
export const SupportPanel = forwardRef<HTMLElement, Props>(function SupportPanel(
  { id, onClose, initialCategory = null }, ref,
) {
  const [need, setNeed] = useState<AcademicNeed | null>(initialCategory);
  const [stage, setStage] = useState<Stage>(initialCategory ? "strategies" : "start");
  const [clarification, setClarification] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const initialRender = useRef(true);
  const [followupChoice, setFollowupChoice] = useState<string | null>(null);
  const clarifier = need ? CLARIFIERS[need] : undefined;
  const followup = need && clarification ? FOLLOWUPS[need]?.[clarification] : undefined;
  const choices = stage === "general"
    ? SUPPORT_OPTIONS.map((choice) => ({ id: choice.id, label: choice.label, text: choice.response }))
    : strategiesFor(need ?? "other", clarification, followupChoice);
  const response = choices.find((choice) => choice.id === strategy)?.text;

  // Announce the new question/menu to keyboard and screen-reader users.
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [stage]);

  function next() {
    if (!need) return;
    setStrategy(null);
    setClarification(null);
    setFollowupChoice(null);
    setStage(CLARIFIERS[need] ? "clarify" : "strategies");
  }

  function resolveClarifier(value: string) {
    setClarification(value);
    setStrategy(null);
    if (value === "continue") return onClose();
    if (value === "general") return setStage("general");
    if (need && FOLLOWUPS[need]?.[value]) return setStage("followup");
    setStage("strategies");
  }

  function finishFollowup(value: string) {
    if (value === "continue") return onClose();
    setFollowupChoice(value);
    setStrategy(null);
    setStage("strategies");
  }

  function reset() {
    setNeed(null);
    setClarification(null);
    setStrategy(null);
    setFollowupChoice(null);
    setStage("start");
  }

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className={styles.panel}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <h2 ref={titleRef} tabIndex={-1} id={`${id}-title`} className={styles.title}>
        {stage === "start" ? "What would you like help with right now?"
          : stage === "clarify" ? clarifier?.heading
          : stage === "followup" ? followup?.heading
          : stage === "general" ? "See all support options"
          : "What would you like to try first?"}
      </h2>
      {stage === "start" && (
        <>
          <p className={styles.note}>Choose where you'd like to start. You can explore other options or return to studying anytime.</p>
          <ul className={styles.options}>
            {ACADEMIC_NEEDS.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.option} aria-pressed={need === item.id}
                  onClick={() => setNeed(item.id)}>{item.label}</button>
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            <Button variant="secondary" disabled={!need} onClick={next}>Continue</Button>
          </div>
        </>
      )}
      {stage === "clarify" && clarifier && (
        <ul className={styles.options}>
          {clarifier.options.map((item) => (
            <li key={item.id}>
              <button type="button" className={styles.option} onClick={() => resolveClarifier(item.id)}>{item.label}</button>
            </li>
          ))}
        </ul>
      )}
      {stage === "followup" && followup && (
        <ul className={styles.options}>
          {followup.options.map((item) => (
            <li key={item.id}>
              <button type="button" className={styles.option} onClick={() => finishFollowup(item.id)}>{item.label}</button>
            </li>
          ))}
        </ul>
      )}
      {(stage === "strategies" || stage === "general") && (
        <>
          <ul className={styles.options}>
            {choices.map((choice) => (
              <li key={choice.id}>
                <button type="button" className={styles.option} aria-pressed={strategy === choice.id}
                  onClick={() => setStrategy(choice.id)}>{choice.label}</button>
              </li>
            ))}
          </ul>
          {response && <p className={styles.response} aria-live="polite">{response}</p>}
        </>
      )}
      <p className={styles.note}>
        StudySense is a study tool, not a counselling service. For human support, consider your university's student services.
      </p>
      <div className={styles.actions}>
        {stage !== "general" && <TextButton onClick={() => { setStrategy(null); setStage("general"); }}>See support options</TextButton>}
        {stage !== "start" && <TextButton onClick={reset}>Back to support question</TextButton>}
        <TextButton onClick={onClose}>Return to studying</TextButton>
      </div>
    </section>
  );
});
