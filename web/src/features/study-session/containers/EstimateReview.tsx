"use client";

import { Sheet } from "@/components/molecules/Sheet";
import { DEFAULT_DEMO_RECORD } from "@/lib/demoRecord";
import type { ProfileCode } from "@/lib/profiles";
import { EstimateNote } from "../components/organisms/EstimateNote";
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
    label: "no prediction (record can't be replayed, or the service failed)",
    view: toEstimateView(null),
  },
  { label: "loading", view: { kind: "loading" } },
];

/**
 * Review sheet for the estimate's states (issue #6), not part of the student's journey. Each case runs a
 * contract-shaped sample through the same mapper the session will use.
 */
export function EstimateReview() {
  return (
    <Sheet>
      <div className={styles.page}>
        <h1 className={styles.title}>Estimate states</h1>
        <p className={styles.lede}>
          Review only: sample predictions in the shape of <code>prediction_contract.json</code>, not model output.
          Not yet shown in the Study Session.
        </p>
        <ol className={styles.cases}>
          {CASES.map((c) => (
            <li key={c.label} className={styles.case}>
              <p className={styles.label}>{c.label}</p>
              {c.note && <p className={styles.note}>{c.note}</p>}
              <EstimateNote view={c.view} record={DEFAULT_DEMO_RECORD} />
            </li>
          ))}
        </ol>
      </div>
    </Sheet>
  );
}
