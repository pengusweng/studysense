import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/atoms/Wordmark";
import { NotFoundNotice } from "@/components/organisms/NotFoundNotice";
import styles from "@/components/organisms/NoticePage.module.css";

export const metadata: Metadata = { title: "Page not found · StudySense" };

/**
 * Fallback only: unknown addresses normally reach (app)/not-found through the catch-all route. This one has no
 * app shell (its styles live in the (app) layout), just the lockup on the desk as the way home.
 */
export default function NotFound() {
  return (
    <>
      <header className={styles.bare}>
        <Link href="/" aria-label="StudySense home">
          <Wordmark mark />
        </Link>
      </header>
      <NotFoundNotice />
    </>
  );
}
