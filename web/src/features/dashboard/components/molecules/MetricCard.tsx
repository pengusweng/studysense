import { Card } from "@/components/molecules/Card";

export function MetricCard({ label, value }: { label: string; value: string | number | null }) {
  return (
    <Card title={label}>
      <strong style={{ fontSize: 24 }}>{value ?? "-"}</strong>
    </Card>
  );
}
