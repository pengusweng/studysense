import type { DailyFeatures } from "../../types";
import { MetricCard } from "../molecules/MetricCard";
import { StressBadge } from "../atoms/StressBadge";

export function MetricsOverview({ latest }: { latest?: DailyFeatures }) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <MetricCard label="Stress" value={latest?.stressScore ?? null} />
        <MetricCard label="Sleep (h)" value={latest?.sleepHours ?? null} />
        <MetricCard label="Steps" value={latest?.steps ?? null} />
      </div>
      <p><StressBadge score={latest?.stressScore ?? null} /></p>
    </>
  );
}
