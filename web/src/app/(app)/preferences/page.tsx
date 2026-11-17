import type { Metadata } from "next";
import { PlannedScreen } from "@/components/organisms/PlannedScreen";

export const metadata: Metadata = { title: "Preferences · StudySense" };

export default function PreferencesPage() {
  return (
    <PlannedScreen title="Preferences" issue="issue #3">
      <p>
        This is where you will choose whether StudySense may ask optional check-ins, how often it may interrupt, and
        which demo record it replays.
      </p>
      <p>For now, the demo record can be changed from the Dashboard.</p>
    </PlannedScreen>
  );
}
