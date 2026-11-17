"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLink.module.css";

/** One app destination, drawn as an index tab. The current destination is pulled up and turns to page paper. */
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} className={styles.tab} aria-current={current ? "page" : undefined}>
      {label}
    </Link>
  );
}
