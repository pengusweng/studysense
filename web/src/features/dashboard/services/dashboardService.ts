import { http } from "@/lib/http";
import type { DailyFeatures } from "../types";

export const dashboardService = {
  getDailyFeatures: () => http<DailyFeatures[]>("/daily-features"),
};
