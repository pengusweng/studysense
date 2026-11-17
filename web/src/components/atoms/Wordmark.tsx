/** Typographic StudySense wordmark. A drawn logo mark does not exist yet (docs/AGENTS.md §9). */
export function Wordmark({ size = "1.375rem" }: { size?: string }) {
  return (
    <span
      style={{
        font: `800 ${size}/1 var(--font-print-stack)`,
        letterSpacing: "-0.035em",
        color: "var(--ink)",
      }}
    >
      Study<span style={{ color: "var(--deep-iris)" }}>Sense</span>
    </span>
  );
}
