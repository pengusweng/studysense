"use client";

import type { RefObject } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import styles from "./HowItWorks.module.css";

const STEPS = [
  "A recorded SSAQS day is replayed in place of a watch.",
  "Inside the session, you may see a tentative daily estimate.",
  "At a natural pause, it may ask one optional question.",
  "Or it stays quiet. Skipping and silence are both fine.",
];

type Props = { onHide: () => void; sectionRef?: RefObject<HTMLElement | null> };

/** First-visit orientation: four ruled lines. Once hidden, it reopens from the provenance strip. */
export function HowItWorks({ onHide, sectionRef }: Props) {
  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      tabIndex={-1}
      className={styles.how}
      aria-labelledby="how-title"
    >
      <div className={styles.head}>
        <h2 id="how-title" className={styles.title}>
          How a session goes
        </h2>
        <TextButton onClick={onHide}>Hide</TextButton>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((s, i) => (
          <li key={s}>
            <span className={styles.n} aria-hidden="true">
              {i + 1}
            </span>
            <p>{s}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
