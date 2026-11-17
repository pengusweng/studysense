import type { EstimateView, Prediction } from "./types";

/**
 * Reads a prediction into what the session shows. An uncertain prediction keeps its candidate profile but is
 * shown as uncertain, and StudySense will not act on it (fallback_recommendation "clarify_or_defer").
 */
export function toEstimateView(prediction: Prediction | null | undefined): EstimateView {
  if (!prediction) return { kind: "unavailable" };
  if (prediction.evidence_status === "missing_evidence" || prediction.predicted_profile === null) {
    return { kind: "missing" };
  }
  const certain = prediction.evidence_status === "confident" && !prediction.is_uncertain;
  return { kind: "estimate", profile: prediction.predicted_profile, certainty: certain ? "confident" : "uncertain" };
}
