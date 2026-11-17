import type { ReactNode } from "react";
import { NavLink } from "@/components/molecules/NavLink";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header style={{ padding: 16, borderBottom: "1px solid #ddd", background: "#fff" }}>
        <strong style={{ marginRight: 24 }}>StudySense</strong>
        <nav style={{ display: "inline" }}>
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/self-report" label="Self-report" />
        </nav>
      </header>
      <main style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>{children}</main>
    </>
  );
}
