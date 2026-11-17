import type { Metadata } from "next";
import { PreferencesContainer } from "@/features/preferences/containers/PreferencesContainer";

export const metadata: Metadata = { title: "Preferences · StudySense" };

export default function PreferencesPage() {
  return <PreferencesContainer />;
}
