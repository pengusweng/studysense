export function StressBadge({ score }: { score: number | null }) {
  const level = score === null ? "n/a" : score >= 70 ? "high" : score >= 40 ? "medium" : "low";
  return <span>Stress level: {level}</span>;
}
