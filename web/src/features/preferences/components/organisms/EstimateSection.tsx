"use client";

import { useEffect, useRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { AnswerList } from "@/components/molecules/AnswerList";
import { ESTIMATE_LEAD, ESTIMATE_MODEL, ESTIMATE_SOURCE } from "@/lib/estimateExplanation";
import { SavedLine, type Saved } from "../atoms/SavedLine";
import styles from "./Preferences.module.css";

type Show = "show" | "hide";

const OPTIONS: { id: Show; label: string }[] = [
  { id: "show", label: "Show it" },
  { id: "hide", label: "Hide it" },
];

type Props = { showEstimate: boolean; onChange: (show: boolean) => void; saved: Saved };

/** Whether the day's estimate appears before a session, and how it is made, readable in place. */
export function EstimateSection({ showEstimate, onChange, saved }: Props) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  return (
    <section className={styles.section} aria-labelledby="prefs-estimate">
      <h2 id="prefs-estimate" className={styles.heading}>
        Estimate
      </h2>
      <AnswerList
        question="Show the day’s estimate before a session?"
        hint="Hidden, it isn’t shown or used to word a suggestion. Default: show it."
        options={OPTIONS}
        value={showEstimate ? "show" : "hide"}
        onChange={(v) => onChange(v === "show")}
      />
      <TextButton
        ref={trigger}
        className={styles.disclose}
        aria-expanded={open}
        aria-controls="prefs-estimate-how"
        onClick={() => setOpen((o) => !o)}
      >
        How the estimate works
      </TextButton>
      {open && (
        <div
          ref={panel}
          id="prefs-estimate-how"
          className={styles.panel}
          tabIndex={-1}
          role="region"
          aria-label="How the estimate works"
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            trigger.current?.focus();
          }}
        >
          <p>{ESTIMATE_SOURCE}</p>
          <p>{ESTIMATE_MODEL}</p>
          <p>{ESTIMATE_LEAD}</p>
        </div>
      )}
      <SavedLine saved={saved} />
    </section>
  );
}
