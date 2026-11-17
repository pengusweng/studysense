import type { ReactNode } from "react";
import styles from "./Ink.module.css";

type Props = {
  children: ReactNode;
  /** Replay the ink reveal when the component mounts. */
  writeOn?: boolean;
  /** Wait this long (ms) before writing, e.g. to follow the page-open sequence. */
  delay?: number;
};

/** Text written in the student's hand, in Iris ink. */
export function Hand({ children, writeOn = false, delay = 0 }: Props) {
  return (
    <span
      className={[styles.hand, writeOn && styles.writeOn].filter(Boolean).join(" ")}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </span>
  );
}
