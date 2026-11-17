import type { DemoDays } from "../types";

/**
 * Replayable SSAQS days. Loaded lazily so the list never weighs on first paint.
 * Swap the body for an `http` call once a backend serves demo records; callers stay the same.
 */
export const demoRecordService = {
  async getDays(): Promise<DemoDays> {
    const { SSAQS_DAYS } = await import("../data/ssaqsDays");
    return SSAQS_DAYS;
  },
};
