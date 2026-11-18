import type { DemoRecord } from "@/lib/demoRecord";
import { http, HttpError } from "@/lib/http";
import type { Prediction } from "../types";

/**
 * The day's prediction for a demo record, in the shape of ml/outputs/prediction_contract.json, from the API's
 * replay of predict_profile. null when the API has no prediction for the record; throws when it can't be reached.
 */
export async function getPrediction(record: DemoRecord): Promise<Prediction | null> {
  try {
    return await http<Prediction>(`/predictions/${record.participant}/${record.date}`);
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return null;
    throw error;
  }
}
