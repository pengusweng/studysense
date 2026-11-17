import type { ReactNode } from "react";

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, background: "#fff" }}>
      {title && <h2 style={{ margin: "0 0 8px", fontSize: 14, color: "#666" }}>{title}</h2>}
      {children}
    </section>
  );
}
