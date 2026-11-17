import { http } from "@/lib/http";
import type { SelfReport } from "../types";

export const selfReportService = {
  submit: (report: SelfReport) =>
    http<void>("/self-reports", { method: "POST", body: JSON.stringify(report) }),
};
