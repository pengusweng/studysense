import { resetCheckIn } from "./checkIn";
import { clearSetupDraft, setConsent } from "./consent";
import { resetDemoRecord } from "./demoRecord";
import { clearFeedback } from "./feedback";
import { resetPreferences } from "./preferences";
import { setSessionStatus } from "./sessionStatus";

/**
 * Clears everything this visit kept about the student: the setup choice, preferences, the session and its
 * check-in, feedback on suggestions, and the chosen demo record. Dark mode is a device setting and stays.
 */
export function clearVisit() {
  setConsent("undecided");
  clearSetupDraft();
  resetPreferences();
  setSessionStatus("none");
  resetCheckIn();
  clearFeedback();
  resetDemoRecord();
}
