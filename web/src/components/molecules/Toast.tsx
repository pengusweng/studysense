"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./Toast.module.css";

type Props = {
  message: string;
  onClose: () => void;
  /** How long it stays when left alone. The countdown holds while it is hovered or focused. */
  duration?: number;
};

/** Matches the release animation in Toast.module.css. */
const RELEASE_MS = 240;

/**
 * A slip of paper set down at the foot of the window for a confirmation that happened somewhere else (for
 * example, a choice saved on another page). A hairline along its foot shows the time left; it is released
 * when that runs out or when Close is pressed. Announced politely, and never the only place an action lives.
 */
export function Toast({ message, onClose, duration = 5000 }: Props) {
  const [held, setHeld] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const remaining = useRef(duration);
  const started = useRef(0);
  const close = useRef(onClose);

  useEffect(() => {
    close.current = onClose;
  });

  // Counts down only while nobody is reading it: hovering or focusing it holds it in place (WCAG 2.2.1).
  useEffect(() => {
    if (held || leaving) return;
    started.current = Date.now();
    const t = window.setTimeout(() => setLeaving(true), remaining.current);
    return () => {
      window.clearTimeout(t);
      remaining.current -= Date.now() - started.current;
    };
  }, [held, leaving]);

  // Released: let the slip slide away, then remove it.
  useEffect(() => {
    if (!leaving) return;
    const t = window.setTimeout(() => close.current(), RELEASE_MS);
    return () => window.clearTimeout(t);
  }, [leaving]);

  return (
    <div
      className={styles.toast}
      style={{ "--toast-ms": `${duration}ms` } as CSSProperties}
      data-held={held || undefined}
      data-leaving={leaving || undefined}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <svg className={styles.tick} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path d="M4.5 10.5 8.3 14.2 15.5 5.8" pathLength={1} />
      </svg>
      <p className={styles.message} role="status">
        {message}
      </p>
      <button type="button" className={styles.close} onClick={() => setLeaving(true)} aria-label="Close message">
        Close
      </button>
      <span className={styles.time} aria-hidden="true" />
    </div>
  );
}
