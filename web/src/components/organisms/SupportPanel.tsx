"use client";

import { forwardRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { SUPPORT_OPTIONS } from "@/lib/supportOptions";
import styles from "./SupportPanel.module.css";

type Props = { id: string; onClose: () => void };

/** The support flow, unfolded in place under whatever asked for it. */
export const SupportPanel = forwardRef<HTMLElement, Props>(function SupportPanel({ id, onClose }, ref) {
  const [chosen, setChosen] = useState<string | null>(null);
  const response = SUPPORT_OPTIONS.find((o) => o.id === chosen)?.response;

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
        {SUPPORT_OPTIONS.map((o) => (
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
