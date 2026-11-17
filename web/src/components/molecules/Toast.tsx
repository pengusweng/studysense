"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";

type Props = {
  message: string;
  onClose: () => void;
  /** How long it stays when left alone. At least 6s; paused while hovered or focused. */
  duration?: number;
};

/**
 * A quiet slip at the foot of the window for a confirmation that happened somewhere else (for example, a
 * choice saved on another page). Announced politely, closable, and never the only place an action lives.
 */
export function Toast({ message, onClose, duration = 7000 }: Props) {
  const [held, setHeld] = useState(false);
  const remaining = useRef(Math.max(duration, 6000));
  const started = useRef(0);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  // Counts down only while nobody is reading it: hovering or focusing it holds it in place (WCAG 2.2.1).
  useEffect(() => {
    if (held) return;
    started.current = Date.now();
    const t = window.setTimeout(() => close.current(), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [held]);

  return (
    <div
      className={styles.toast}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <p className={styles.message} role="status">
        {message}
      </p>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close message">
        Close
      </button>
    </div>
  );
}
