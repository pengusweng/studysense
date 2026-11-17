import type { ReactNode } from "react";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import { Sheet } from "@/components/molecules/Sheet";
import styles from "./NoticePage.module.css";

type Props = { title: string; line: string; children: ReactNode };

/**
 * A plain stop on the notebook page: what happened in one sentence, a quiet line under it, and the way on.
 * Used for "not found" and "something went wrong"; help stays reachable, and nothing technical is shown.
 */
export function NoticePage({ title, line, children }: Props) {
  return (
    <Sheet>
      <div className={styles.body}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.line}>{line}</p>
        <div className={styles.actions}>{children}</div>
        <HelpCorner />
      </div>
    </Sheet>
  );
}
