import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/atoms/Wordmark";
import { NavLink } from "@/components/molecules/NavLink";
import styles from "./AppShell.module.css";

/** The three persistent destinations (docs/AGENTS.md §4). Everything else is a contextual flow. */
const DESTINATIONS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/study-session", label: "Study Session" },
  { href: "/preferences", label: "Preferences" },
];

/**
 * App chrome: the wordmark on the desk and the destinations as index tabs standing on the top edge of the
 * page's sheet. Pages render their own Sheet directly below.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.inner}>
          <Link href="/" className={styles.brand} aria-label="StudySense home">
            <Wordmark />
          </Link>
          <nav aria-label="App" className={styles.nav}>
            <ul className={styles.tabs}>
              {DESTINATIONS.map((d) => (
                <li key={d.href}>
                  <NavLink href={d.href} label={d.label} />
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </>
  );
}
