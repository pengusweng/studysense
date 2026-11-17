import { LogoMark } from "./LogoMark";

/** The StudySense wordmark, optionally locked up with the mark on its left (docs/AGENTS.md §9, DESIGN.md Brand). */
export function Wordmark({ size = "1.375rem", mark = false }: { size?: string; mark?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35em",
        font: `800 ${size}/1 var(--font-print-stack)`,
        letterSpacing: "-0.035em",
        color: "var(--ink)",
      }}
    >
      {mark && <LogoMark size="1.2em" />}
      <span>
        Study<span style={{ color: "var(--deep-iris)" }}>Sense</span>
      </span>
    </span>
  );
}
