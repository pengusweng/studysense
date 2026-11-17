import type { ReactNode } from "react";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section
      style={{
        border: "1px solid var(--proposal-rule-strong)",
        borderRadius: 12,
        padding: "var(--proposal-space-3)",
        background: "var(--cloud-white)",
      }}
    >
      {title && (
        <h2 style={{ margin: "0 0 var(--proposal-space-2)", fontSize: "var(--proposal-text-sm)", color: "var(--proposal-pencil)" }}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
