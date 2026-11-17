"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { LogoMark } from "@/components/atoms/LogoMark";
import { TextButton } from "@/components/atoms/TextButton";
import { Wordmark } from "@/components/atoms/Wordmark";
import { AnswerList } from "@/components/molecules/AnswerList";
import { Sheet } from "@/components/molecules/Sheet";
import { Toast } from "@/components/molecules/Toast";
import { Tooltip } from "@/components/molecules/Tooltip";
import styles from "./ComponentsReview.module.css";

type Pick = "a" | "b";
const PICKS: { id: Pick; label: string }[] = [
  { id: "a", label: "Yes, now and then" },
  { id: "b", label: "No, keep quiet" },
];

/**
 * Review sheet for the system components design issue #2 asks for, in every state, including the ones no screen
 * reaches yet (button loading, tooltip, toast). Not part of the student's journey and not linked from the app.
 */
export function ComponentsReview() {
  const [unselected, setUnselected] = useState<Pick | null>(null);
  const [selected, setSelected] = useState<Pick | null>("a");
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const [status, setStatus] = useState("");

  return (
    <Sheet>
      <div className={styles.page}>
        <h1 className={styles.title}>System components</h1>
        <p className={styles.lede}>
          Review only. Every component from design issue #2 in its states. Tab through the page to see focus.
        </p>

        <section className={styles.section} aria-labelledby="rc-brand">
          <h2 id="rc-brand" className={styles.heading}>
            Brand
          </h2>
          <div className={styles.row}>
            <Wordmark mark size="1.75rem" />
            <LogoMark size="48px" />
            <LogoMark size="32px" />
            <LogoMark size="16px" />
          </div>
          <p className={styles.note}>
            The mark: a notebook page with its margin and one stroke of the student&rsquo;s pen, the signature motif.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="rc-buttons">
          <h2 id="rc-buttons" className={styles.heading}>
            Buttons
          </h2>
          {(["primary", "secondary"] as const).map((variant) => (
            <div key={variant} className={styles.row}>
              <span className={styles.label}>{variant}</span>
              <Button variant={variant}>Default</Button>
              <Button variant={variant} disabled>
                Disabled
              </Button>
              <Button variant={variant} loading>
                Save
              </Button>
            </div>
          ))}
          <div className={styles.row}>
            <span className={styles.label}>text</span>
            <TextButton>Text action</TextButton>
            <TextButton disabled>Disabled text action</TextButton>
          </div>
          <p className={styles.note}>Hover darkens primary to Ink and tints secondary; loading keeps the colours.</p>
        </section>

        <section className={styles.section} aria-labelledby="rc-choice">
          <h2 id="rc-choice" className={styles.heading}>
            Choice
          </h2>
          <div className={styles.grid}>
            <AnswerList question="Unselected" hint="Nothing is preselected." options={PICKS} value={unselected} onChange={setUnselected} />
            <AnswerList question="Selected" hint="Circled in Iris, the student's mark." options={PICKS} value={selected} onChange={setSelected} />
            <AnswerList question="Disabled" hint="Applies only when check-ins are on." options={PICKS} value="a" onChange={() => {}} disabled />
          </div>
        </section>

        <section className={styles.section} aria-labelledby="rc-disclosure">
          <h2 id="rc-disclosure" className={styles.heading}>
            Inline disclosure and status
          </h2>
          <div className={styles.row}>
            <TextButton aria-expanded={open} aria-controls="rc-panel" onClick={() => setOpen((o) => !o)}>
              What does this mean?
            </TextButton>
          </div>
          {open && (
            <div id="rc-panel" className={styles.panel}>
              <p>The explanation unfolds in place, ruled off above, on the same paper.</p>
            </div>
          )}
          <div className={styles.row}>
            <Button variant="secondary" onClick={() => setStatus("Saved for this visit.")}>
              Change something
            </Button>
          </div>
          <p className={styles.status} role="status">
            {status}
          </p>
        </section>

        <section className={styles.section} aria-labelledby="rc-tooltip">
          <h2 id="rc-tooltip" className={styles.heading}>
            Tooltip and toast
          </h2>
          <div className={styles.row}>
            <Tooltip text="A short label, never the only place it is said">
              <Button variant="secondary">Hover or focus</Button>
            </Tooltip>
            <Button variant="secondary" onClick={() => setToast(true)}>
              Show a toast
            </Button>
          </div>
          <p className={styles.note}>
            The toast stays at least 6 seconds, holds while hovered or focused, and closes by its button.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="rc-feedback">
          <h2 id="rc-feedback" className={styles.heading}>
            Contextual prompt and response feedback
          </h2>
          <p className={styles.note}>
            The check-in, the response note and Accept, Dismiss and Correct are shown with real rules on{" "}
            <Link href="/review/estimate">Estimate and response states</Link>.
          </p>
        </section>
      </div>
      {toast && <Toast message="Your choice is saved for this visit." onClose={() => setToast(false)} />}
    </Sheet>
  );
}
