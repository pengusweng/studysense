import type { ReactNode } from "react";

export function Heading({ children }: { children: ReactNode }) {
  return (
    <h1 style={{ margin: "0 0 var(--proposal-space-4)", fontSize: "var(--proposal-text-xl)", letterSpacing: "-0.02em" }}>
      {children}
    </h1>
  );
}
