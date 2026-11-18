"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/molecules/Sheet";
import { DEFAULT_DEMO_RECORD } from "@/lib/demoRecord";
import type { ProfileCode } from "@/lib/profiles";
import { EstimateNote } from "../components/organisms/EstimateNote";
import { ResponseNote } from "../components/organisms/ResponseNote";
import { getResponse, type ResponseDecision, type ResponseInput } from "../services/responseService";
import { toEstimateView } from "../estimateView";
import type { EstimateView, Prediction } from "../types";
import styles from "./EstimateReview.module.css";

/** A prediction shaped exactly like ml/outputs/prediction_contract.json. Sample values, for review only. */
function sample(profile: ProfileCode | null, evidence: Prediction["evidence_status"]): Prediction {
  const missing = evidence === "missing_evidence";
  return {
    predicted_profile: missing ? null : profile,
    probabilities: { LSLA: null, LSHA: null, HSLA: null, HSHA: null },
    confidence_score: 0,
    is_uncertain: evidence !== "confident",
    evidence_status: evidence,
    fallback_recommendation: evidence === "confident" ? "proceed" : "clarify_or_defer",
    model_version: "sample",
    contract_version: "1.0.0",
    missing_features: [],
  };
}

const CASES: { label: string; note?: string; view: EstimateView }[] = [
  ...(["LSLA", "LSHA", "HSLA", "HSHA"] as const).map((code) => ({
    label: `evidence_status: confident · predicted_profile: ${code}`,
    view: toEstimateView(sample(code, "confident")),
  })),
  {
    label: "evidence_status: uncertain · predicted_profile: LSHA · clarify_or_defer",
    note: "What the current model returns for every day it can place: its policy never accepts a prediction.",
    view: toEstimateView(sample("LSHA", "uncertain")),
  },
  {
    label: "evidence_status: missing_evidence · predicted_profile: null",
    note: "More than half of the day's 17 inputs are missing.",
    view: toEstimateView(sample(null, "missing_evidence")),
  },
  {
    label: "no prediction for this record",
    note: "The API has no prediction for the record (it returns 404).",
    view: toEstimateView(null),
  },
  { label: "record can't be replayed", view: { kind: "unavailable", reason: "record" } },
  { label: "loading", view: { kind: "loading" } },
];

const HSHA: EstimateView = { kind: "estimate", profile: "HSHA", certainty: "confident" };
const NO_ESTIMATE: EstimateView = { kind: "unavailable", reason: "none" };

/** Each runs the session's own rules; only the inputs are samples. */
const RESPONSE_CASES: { label: string; input: ResponseInput }[] = [
  { label: "swamped · confident HSHA estimate", input: { estimate: HSHA, checkIn: "swamped", history: [] } },
  { label: "swamped · no estimate", input: { estimate: NO_ESTIMATE, checkIn: "swamped", history: [] } },
  {
    label: "swamped · \"Break a task\" dismissed earlier this visit",
    input: { estimate: NO_ESTIMATE, checkIn: "swamped", history: [{ suggestion: "steps", action: "dismiss" }] },
  },
  {
    label: "correction: \"It's more than this\"",
    input: { estimate: NO_ESTIMATE, checkIn: "swamped", correction: "more", history: [] },
  },
  { label: "focused · confident HSHA estimate", input: { estimate: HSHA, checkIn: "focused", history: [] } },
  { label: "correction: \"I'm fine, just busy\"", input: { estimate: HSHA, checkIn: "swamped", correction: "fine", history: [] } },
  { label: "correction: \"Something else is going on\"", input: { estimate: NO_ESTIMATE, checkIn: "swamped", correction: "other", history: [] } },
  { label: "skipped, dismissed or no response", input: { estimate: HSHA, checkIn: "skipped", history: [] } },
  { label: "not asked (opted out) · confident HSHA estimate", input: { estimate: HSHA, checkIn: "unasked", history: [] } },
];

const SILENT_LINE = {
  flow: "Silent: one line, “… StudySense will stay quiet for the rest of this session.”",
  declined: "Silent: nothing is shown, and the prompt isn’t repeated.",
  abstain: "Silent: an estimate alone never interrupts.",
};

const noop = () => {};

/**
 * Review sheet for the estimate's states (issue #6), not part of the student's journey. Each case runs a
 * contract-shaped sample through the same mapper the session will use.
 */
export function EstimateReview() {
  const [decisions, setDecisions] = useState<ResponseDecision[] | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all(RESPONSE_CASES.map((c) => getResponse(c.input))).then((d) => live && setDecisions(d));
    return () => {
      live = false;
    };
  }, []);

  return (
    <Sheet>
      <div className={styles.page}>
        <h1 className={styles.title}>Estimate and response states</h1>
        <p className={styles.lede}>
          Review only: sample predictions in the shape of <code>prediction_contract.json</code>, not model output.
          The estimate shows on the Study Session&rsquo;s ready screen; a response follows the check-in on the first
          pause.
        </p>
        <h2 className={styles.section}>Estimate</h2>
        <ol className={styles.cases}>
          {CASES.map((c) => (
            <li key={c.label} className={styles.case}>
              <p className={styles.label}>{c.label}</p>
              {c.note && <p className={styles.note}>{c.note}</p>}
              <EstimateNote view={c.view} record={DEFAULT_DEMO_RECORD} />
            </li>
          ))}
        </ol>

        <h2 className={styles.section}>Response, from the session&rsquo;s rules</h2>
        <ol className={styles.cases}>
          {RESPONSE_CASES.map((c, i) => {
            const decision = decisions?.[i];
            return (
              <li key={c.label} className={styles.case}>
                <p className={styles.label}>{c.label}</p>
                {!decision && <p className={styles.note}>Asking the API&hellip;</p>}
                {decision?.kind === "offer" && (
                  <ResponseNote
                    offer={decision}
                    canCorrect={decision.basis !== "correction"}
                    onAccept={noop}
                    onDismiss={noop}
                    onCorrect={noop}
                    onOtherOptions={noop}
                  />
                )}
                {decision?.kind === "support" && <p className={styles.note}>Opens the full support list in place.</p>}
                {decision?.kind === "silent" && <p className={styles.note}>{SILENT_LINE[decision.reason]}</p>}
              </li>
            );
          })}
        </ol>
      </div>
    </Sheet>
  );
}
