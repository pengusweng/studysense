import type { DemoRecord } from "@/lib/demoRecord";
import type { Prediction } from "../types";

/**
 * The day's prediction for a demo record, in the shape of ml/outputs/prediction_contract.json.
 *
 * Stopgap: no trained model is in the repo yet, so there is nothing to return and every session shows
 * "No estimate for this session". Replace the body with a lookup of precomputed `predict_profile` output
 * (one per SSAQS participant-day) once the model artifact is available.
 */
export async function getPrediction(record: DemoRecord): Promise<Prediction | null> {
  void record;
  return null;
}
