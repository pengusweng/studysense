import { resetCheckIn } from "./checkIn";
import { clearSetupDraft, setConsent } from "./consent";
import { resetDemoRecord } from "./demoRecord";
import { clearFeedback } from "./feedback";
import { resetPreferences } from "./preferences";
import { setSessionStatus } from "./sessionStatus";
import { rotateVisitId } from "./visitId";

/**
 * Clears everything this visit kept about the student: the setup choice, preferences, the session and its
 * check-in, feedback on suggestions, and the chosen demo record. A new visit id means later logged events are no
 * longer grouped with earlier ones; events already sent to the API's log stay there.
 */
export function clearVisit() {
  setConsent("undecided");
  clearSetupDraft();
  resetPreferences();
  setSessionStatus("none");
  resetCheckIn();
  clearFeedback();
  resetDemoRecord();
  rotateVisitId();
}
