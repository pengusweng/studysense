import type { ReactNode } from "react";
import { VisuallyHidden } from "@/components/atoms/VisuallyHidden";
import styles from "./Ink.module.css";

type Props = {
  children: ReactNode;
  struck: boolean;
  /** Announced to screen readers when struck. Pass "" when the surrounding heading already gives the meaning. */
  srSuffix?: string;
  /** Fade the text to pencil when struck. Off for statements that must stay fully legible. */
  muted?: boolean;
  /** Draw the stroke when the enclosing spread scrolls into view, after this many ms. */
  drawDelay?: number;
};

/** Text with an ink stroke through every line of it. Never erased. */
export function Strike({ children, struck, srSuffix = " (ruled out)", muted = true, drawDelay }: Props) {
  return (
    <span
      className={[styles.strike, struck && styles.struck, struck && muted && styles.muted].filter(Boolean).join(" ")}
      data-strike={drawDelay !== undefined ? "" : undefined}
      style={drawDelay !== undefined ? { transitionDelay: `${drawDelay}ms` } : undefined}
    >
      {children}
      {struck && srSuffix && <VisuallyHidden>{srSuffix}</VisuallyHidden>}
    </span>
  );
}
