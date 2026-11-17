import type { ReactNode } from "react";
import styles from "./Sheet.module.css";

/**
 * One graph-ruled page of the notebook, the container every app screen is set on.
 * It meets the AppShell's index tabs flush at its top edge.
 */
export function Sheet({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.sheet, className].filter(Boolean).join(" ")}>{children}</div>;
}
