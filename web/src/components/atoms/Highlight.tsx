import type { ReactNode } from "react";
import styles from "./Ink.module.css";

/** Sage highlighter. Palette law: used on sensor evidence only. */
export function Highlight({ children }: { children: ReactNode }) {
  return <mark className={styles.highlight} style={{ color: "inherit" }}>{children}</mark>;
}
