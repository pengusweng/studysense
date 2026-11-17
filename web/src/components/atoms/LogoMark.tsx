/**
 * The StudySense mark: a notebook page with its margin line and one stroke of the student's pen across it.
 * The stroke is the signature motif (DESIGN.md, Brand), drawn from the same path family as the underline
 * under "Studying.". Decorative wherever the wordmark or a label already names StudySense.
 */
export function LogoMark({ size = "1.6em", className }: { size?: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      style={{ flex: "none", overflow: "visible" }}
    >
      {/* The page, set slightly off square like paper on a desk. */}
      <rect
        x="5.5"
        y="3.5"
        width="21"
        height="25"
        rx="2.5"
        fill="var(--cloud-white)"
        stroke="var(--ink)"
        strokeWidth="1.6"
        transform="rotate(-4 16 16)"
      />
      {/* Two faint rules and the margin line. */}
      <g transform="rotate(-4 16 16)">
        <path d="M13 11h10.5M13 15.5h10.5" stroke="var(--proposal-rule-strong)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M10.5 4.5v23" stroke="var(--ink)" strokeOpacity="0.4" strokeWidth="1.2" />
      </g>
      {/* The pen stroke: Iris, the student's own mark. */}
      <path
        d="M8.5 22.2 C 12 20.6, 15.5 23, 19.5 21.2 S 26 19.4, 29 20"
        fill="none"
        stroke="var(--iris)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
