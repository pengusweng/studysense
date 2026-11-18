import type { DemoDays } from "./demoRecord";
import { http } from "./http";

/** Replayable SSAQS days, from the API: the days with at least one of the model's 17 inputs. */
export const demoRecordService = {
  getDays(): Promise<DemoDays> {
    return http<DemoDays>("/demo/days");
  },
};
