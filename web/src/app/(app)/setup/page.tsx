import type { Metadata } from "next";
import { SetupContainer } from "@/features/setup/containers/SetupContainer";

export const metadata: Metadata = { title: "Setup · StudySense" };

export default function SetupPage() {
  return <SetupContainer />;
}
