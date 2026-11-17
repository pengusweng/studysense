"use client";

import { Heading } from "@/components/atoms/Heading";
import { useDailyFeatures } from "../hooks/useDailyFeatures";
import { MetricsOverview } from "../components/organisms/MetricsOverview";

export function DashboardContainer() {
  const { data, loading, error } = useDailyFeatures();

  return (
    <>
      <Heading>Dashboard</Heading>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && <MetricsOverview latest={data.at(-1)} />}
    </>
  );
}
