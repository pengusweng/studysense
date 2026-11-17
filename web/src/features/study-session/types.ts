import type { ProfileCode } from "@/lib/profiles";

export type { DemoDays, RecordCheck } from "@/lib/demoRecord";

/** The panel unfolded from the demo source note, if any. */
export type NotePanel = "about" | "change" | null;

/** What the Study Session screen shows. */
export type SessionPhase = "ready" | "active" | "paused" | "ended";

/**
 * One prediction, exactly as ml/outputs/prediction_contract.json (v1.0.0) defines it. Probabilities are
 * uncalibrated and are never shown (docs/AGENTS.md §14.6).
 */
export type Prediction = {
  predicted_profile: ProfileCode | null;
  probabilities: Record<ProfileCode, number | null>;
  confidence_score: number;
  is_uncertain: boolean;
  evidence_status: "confident" | "uncertain" | "missing_evidence";
  fallback_recommendation: "proceed" | "clarify_or_defer";
  model_version: string;
  contract_version: string;
  missing_features: string[];
};

/** What the session shows for the day's estimate. */
export type EstimateView =
  | { kind: "loading" }
  /**
   * Journey path 4: no estimate. "record" when the demo record can't be replayed, "none" when the record is
   * fine but there is no prediction for it.
   */
  | { kind: "unavailable"; reason: "record" | "none" }
  /** Too much of the day is missing for the model to place it. */
  | { kind: "missing" }
  | { kind: "estimate"; profile: ProfileCode; certainty: "confident" | "uncertain" };
