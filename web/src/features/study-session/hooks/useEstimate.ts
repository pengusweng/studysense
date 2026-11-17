"use client";

import { useEffect, useState } from "react";
import type { DemoRecord, RecordCheck } from "@/lib/demoRecord";
import { toEstimateView } from "../estimateView";
import { getPrediction } from "../services/estimateService";
import type { EstimateView, Prediction } from "../types";

const LOADING: EstimateView = { kind: "loading" };

/** The estimate for the chosen demo record, re-fetched whenever the record changes. */
export function useEstimate(record: DemoRecord, check: RecordCheck): EstimateView {
  const key = `${record.participant}/${record.date}`;
  const [result, setResult] = useState<{ key: string; prediction: Prediction | null } | null>(null);

  useEffect(() => {
    if (check !== "available") return;
    let live = true;
    getPrediction({ participant: record.participant, date: record.date })
      .catch(() => null)
      .then((prediction) => live && setResult({ key, prediction }));
    return () => {
      live = false;
    };
  }, [key, check, record.participant, record.date]);

  if (check === "checking") return LOADING;
  if (check === "unavailable") return { kind: "unavailable", reason: "record" };
  if (result?.key !== key) return LOADING;
  return toEstimateView(result.prediction);
}
