import type { ReactNode } from "react";
import Link from "next/link";
import { NavLink } from "@/components/molecules/NavLink";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header
        style={{
          padding: "var(--proposal-space-3) var(--proposal-space-4)",
          borderBottom: "1px solid var(--proposal-rule-strong)",
          background: "var(--cloud-white)",
        }}
      >
        <Link href="/" style={{ marginRight: "var(--proposal-space-5)", fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>
          StudySense
        </Link>
        <nav aria-label="App" style={{ display: "inline" }}>
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/self-report" label="Self-report" />
        </nav>
      </header>
      <main style={{ padding: "var(--proposal-space-4)", maxWidth: 960, margin: "0 auto" }}>{children}</main>
    </>
  );
}
