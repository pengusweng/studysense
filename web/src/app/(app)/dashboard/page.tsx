import type { Metadata } from "next";
import { DashboardContainer } from "@/features/dashboard/containers/DashboardContainer";

export const metadata: Metadata = { title: "Dashboard · StudySense" };

export default function DashboardPage() {
  return <DashboardContainer />;
}
