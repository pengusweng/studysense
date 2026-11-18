"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { ESTIMATE_LEAD, ESTIMATE_MISSING, ESTIMATE_MODEL, ESTIMATE_SOURCE } from "@/lib/estimateExplanation";
import { profileByCode } from "@/lib/profiles";
import { ProfileMark } from "../atoms/ProfileMark";
import type { EstimateView } from "../../types";
import styles from "./EstimateNote.module.css";

type Props = { view: EstimateView };

type Copy = { statement: ReactNode; hedge?: string; explain?: "estimate" | "missing" };

function copyFor(view: EstimateView): Copy {
  switch (view.kind) {
    case "loading":
      return { statement: "Preparing the estimate…" };
    case "unavailable":
      return {
        statement: "No estimate for this session.",
        hedge:
          view.reason === "record"
            ? "This demo record can’t be replayed. You can still study, and help is still here."
            : "None is available for this demo day yet. You can still study, and help is still here.",
      };
    case "missing":
      return {
        statement: "The replayed day can’t be placed in a profile.",
        hedge: "Too little of it was recorded, so StudySense won’t guess. You can study and ask for help as usual.",
        explain: "missing",
      };
    case "estimate": {
      const name = <strong>{profileByCode(view.profile).name.toLowerCase()}</strong>;
      return view.certainty === "confident"
        ? {
            statement: <>The replayed day suggests {name}.</>,
            hedge: "An estimate for one recorded day, not how you feel right now.",
            explain: "estimate",
          }
        : {
            statement: <>The replayed day may suggest {name}.</>,
            hedge: "It’s a rough guess, so StudySense won’t prompt you or change anything because of it.",
            explain: "estimate",
          };
    }
  }
}

/**
 * The day's tentative estimate (issue #6): the model's lead, never a reading of the student. Set in print and
 * pencil only (no Iris, which is the student's hand; no Sage, which marks recorded values), with no numbers.
 * Every state says what it is based on and opens an explanation in place.
 */
export function EstimateNote({ view }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const copy = copyFor(view);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  // Which record was replayed is said once, in the demo footnote under Start; here only what the model gave.
  const provenance = view.kind === "estimate" ? [view.profile, "model estimate"] : null;

  return (
    <section className={styles.estimate} data-kind={view.kind} aria-labelledby={`${id}-title`} aria-busy={view.kind === "loading"}>
      <div className={styles.row}>
        {view.kind !== "unavailable" && (
          <ProfileMark
            profile={view.kind === "estimate" ? view.profile : undefined}
            certainty={view.kind === "estimate" ? view.certainty : undefined}
          />
        )}
        <div className={styles.text}>
          <h2 id={`${id}-title`} className={styles.statement}>
            {copy.statement}
          </h2>
          {provenance && (
            <p className={styles.source}>
              {/* The dot is glued to the fact before it (no-break space), so a wrapped line never starts with one. */}
              {provenance.join("\u00a0· ")}
            </p>
          )}
          {copy.hedge && <p className={styles.hedge}>{copy.hedge}</p>}
          {copy.explain && (
            <TextButton
              ref={trigger}
              className={styles.why}
              aria-expanded={open}
              aria-controls={`${id}-why`}
              onClick={() => setOpen((o) => !o)}
            >
              How the estimate works
            </TextButton>
          )}
        </div>
      </div>

      {open && copy.explain && (
        <div
          ref={panel}
          id={`${id}-why`}
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
          <p>{copy.explain === "estimate" ? ESTIMATE_MODEL : ESTIMATE_MISSING}</p>
          <p>{ESTIMATE_LEAD}</p>
        </div>
      )}
    </section>
  );
}
