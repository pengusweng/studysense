"use client";

import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboardService";
import type { DailyFeatures } from "../types";

export function useDailyFeatures() {
  const [data, setData] = useState<DailyFeatures[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService
      .getDailyFeatures()
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}
