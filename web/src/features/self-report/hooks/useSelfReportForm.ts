"use client";

import { useState } from "react";
import { selfReportService } from "../services/selfReportService";
import type { SelfReport } from "../types";

export function useSelfReportForm() {
  const [values, setValues] = useState<SelfReport>({ stress: 3, anxiety: 3 });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setValue = (key: keyof SelfReport, value: number) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      await selfReportService.submit(values);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return { values, setValue, submit, submitting, error };
}
