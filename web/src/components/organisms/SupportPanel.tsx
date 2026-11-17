"use client";

import { forwardRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import styles from "./SupportPanel.module.css";

/**
 * Predefined support options and their template responses (docs/AGENTS.md §2 rules 8 and 11, §7).
 * Reachable with no session and no estimate. Nothing here is generated.
 */
const OPTIONS = [
  {
    id: "steps",
    label: "Break a task into smaller steps",
    response: "Pick the one task in front of you and write down only its first step. Start there; the rest can wait.",
  },
  {
    id: "break",
    label: "Take a short break",
    response: "Step away from the screen for a little while, then come back to the same place. Your work will be here.",
  },
  {
    id: "shorter",
    label: "Make the next study block shorter",
    response: "Plan a shorter block than usual for the next round. You can lengthen it again once it feels easier.",
  },
  {
    id: "lighter",
    label: "Switch to something lighter for a while",
    response: "Move to a less demanding task, like tidying notes or reviewing something familiar, then return when you're ready.",
  },
] as const;

type Props = { id: string; onClose: () => void };

/** The support flow, unfolded in place under whatever asked for it. */
export const SupportPanel = forwardRef<HTMLElement, Props>(function SupportPanel({ id, onClose }, ref) {
  const [chosen, setChosen] = useState<string | null>(null);
  const response = OPTIONS.find((o) => o.id === chosen)?.response;

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={-1}
      aria-labelledby={`${id}-title`}
      className={styles.panel}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <h2 id={`${id}-title`} className={styles.title}>
        What would help right now?
      </h2>
      <ul className={styles.options}>
        {OPTIONS.map((o) => (
          <li key={o.id}>
            <button
              type="button"
              className={styles.option}
              aria-pressed={chosen === o.id}
              onClick={() => setChosen(o.id)}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.response} aria-live="polite">
        {response}
      </p>
      <p className={styles.note}>
        StudySense is a study tool, not a counselling service. If you want to talk to someone, your university&rsquo;s
        student services are there for that.
      </p>
      <TextButton onClick={onClose}>Close</TextButton>
    </section>
  );
});
