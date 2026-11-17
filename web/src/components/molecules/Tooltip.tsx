"use client";

import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from "react";
import styles from "./Tooltip.module.css";

type Props = {
  text: string;
  /** One focusable element; it gets the tooltip's id as its description. */
  children: ReactElement<{ "aria-describedby"?: string }>;
  /**
   * False when the trigger's accessible name already says the same thing, so screen readers don't hear it twice.
   * The tip is then only for sighted keyboard, mouse and touch users.
   */
  describe?: boolean;
  /** Applied to the wrapper, which is what sits in the surrounding layout. */
  className?: string;
  /** Extra class for the tip itself, e.g. to show it only where the trigger has no visible label. */
  tipClassName?: string;
  /** "end" lines the tip up with the trigger's right edge, for triggers near the right of the window. */
  align?: "center" | "end";
};

const HOVER_DELAY = 300;
/** A tap can't hover, so on touch the tip shows briefly after the tap. */
const TAP_SHOW = 1600;

/**
 * A small label on raised paper under its trigger. Shown on hover (after a short delay) and on keyboard focus,
 * gone on leave, blur or Escape, and it stays while the pointer is over it (WCAG 1.4.13). It never holds
 * anything that isn't also said elsewhere.
 */
export function Tooltip({ text, children, describe = true, className, tipClassName, align = "center" }: Props) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function show(delay: number) {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(true), delay);
  }

  function tapped() {
    window.clearTimeout(timer.current);
    setOpen(true);
    timer.current = window.setTimeout(() => setOpen(false), TAP_SHOW);
  }

  function hide() {
    window.clearTimeout(timer.current);
    setOpen(false);
  }

  return (
    <span
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      onPointerEnter={(e) => e.pointerType === "mouse" && show(HOVER_DELAY)}
      onPointerLeave={(e) => e.pointerType === "mouse" && hide()}
      onPointerUp={(e) => e.pointerType !== "mouse" && tapped()}
      onFocus={(e) => (e.target as HTMLElement).matches(":focus-visible") && show(0)}
      onBlur={hide}
      onKeyDown={(e) => e.key === "Escape" && open && hide()}
    >
      {describe ? cloneElement(children, { "aria-describedby": id }) : children}
      <span id={id} role="tooltip" className={[styles.tip, tipClassName].filter(Boolean).join(" ")} data-open={open || undefined} data-align={align} aria-hidden={!describe || undefined}>
        {text}
      </span>
    </span>
  );
}
