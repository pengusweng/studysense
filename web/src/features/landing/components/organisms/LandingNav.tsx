import Link from "next/link";
import { ButtonLink } from "@/components/atoms/ButtonLink";
import { Wordmark } from "@/components/atoms/Wordmark";
import { ThemeToggle } from "@/components/molecules/ThemeToggle";
import { Hand } from "../atoms/Hand";
import styles from "./LandingNav.module.css";

export type NavSection = { id: string; label: string };

type Props = {
  sections: NavSection[];
  active: string | null;
  scrolled: boolean;
};

/**
 * The landing page's header. Everything sits on the notebook's top edge on one line: the wordmark on the
 * desk, index-divider tabs for each spread (the one being read is pulled up), and the demo as the last,
 * filled tab. The app's own nav lives in AppShell.
 */
export function LandingNav({ sections, active, scrolled }: Props) {
  return (
    <header className={styles.header} data-scrolled={scrolled || undefined}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="StudySense home">
          <Wordmark />
          <span className={styles.subject} aria-hidden="true">
            <Hand>studying, with evidence</Hand>
          </span>
        </Link>
        <ThemeToggle className={styles.theme} />

        <nav aria-label="On this page" className={styles.tabsNav}>
          <ul className={styles.tabs}>
            {sections.map((section, i) => (
              <li key={section.id} style={{ "--i": i } as React.CSSProperties}>
                <a
                  href={`#${section.id}`}
                  className={styles.tab}
                  aria-current={active === section.id ? "location" : undefined}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ButtonLink href="/dashboard" className={styles.demo}>
          Open the demo
        </ButtonLink>
      </div>
    </header>
  );
}
