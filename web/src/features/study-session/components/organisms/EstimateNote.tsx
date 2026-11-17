"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { formatParticipant, formatRecordDate, type DemoRecord } from "@/lib/demoRecord";
import { profileByCode } from "@/lib/profiles";
import { ProfileMark } from "../atoms/ProfileMark";
import type { EstimateView } from "../../types";
import styles from "./EstimateNote.module.css";

type Props = { view: EstimateView; record: DemoRecord };

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
            hedge: "The evidence is thin, so StudySense won’t act on this estimate.",
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
export function EstimateNote({ view, record }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const copy = copyFor(view);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  const source = [`SSAQS ${formatParticipant(record.participant)}`, formatRecordDate(record.date), "replayed"];
  const provenance =
    view.kind === "estimate" ? [view.profile, `estimated from ${source[0]}`, ...source.slice(1)] : view.kind === "missing" ? source : null;

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
              Why is this tentative?
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
          aria-label="Why the estimate is tentative"
          onKeyDown={(e) => {
            if (e.key !== "Escape") return;
            setOpen(false);
            trigger.current?.focus();
          }}
        >
          <p>
            It comes from one recorded day of another student’s Fitbit data in the SSAQS dataset, replayed for the
            demo. Nothing is measured from you.
          </p>
          {copy.explain === "estimate" ? (
            <p>
              A model sorts days into four profiles by splitting stress and anxiety at the midpoint. That split is a
              course threshold, not a clinical one, and the model’s guesses are rough.
            </p>
          ) : (
            <p>
              A model sorts days into four profiles, but when more than half of a day’s readings are missing it
              doesn’t guess.
            </p>
          )}
          <p>So treat it as a lead, not a verdict. If it doesn’t fit, you can correct it or ignore it.</p>
        </div>
      )}
    </section>
  );
}
