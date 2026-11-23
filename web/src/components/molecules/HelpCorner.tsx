"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { TextButton } from "@/components/atoms/TextButton";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import { wrappedDialogFocusIndex } from "@/lib/supportDialogFocus";
import styles from "./HelpCorner.module.css";

/**
 * Voluntary support stays reachable in every phase. Render its dialog at document.body, not inside the
 * session sheet: the sheet and animated content otherwise clip the bottom of the support controls (#13).
 */
export function HelpCorner({ align = "end" }: { align?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const supportId = `${useId()}-support`;

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    // Focus returns to the initiating control after the portal is removed.
    requestAnimationFrame(() => trigger.current?.focus());
  }

  function keepFocusInside(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") return;
    const focusable = Array.from(
      dialog.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => element.getClientRects().length > 0);
    const current = focusable.indexOf(document.activeElement as HTMLElement);
    const next = wrappedDialogFocusIndex(current, focusable.length - 1, event.shiftKey);
    if (next === null) return;
    event.preventDefault();
    focusable[next]?.focus();
  }

  return (
    <div className={styles.corner} data-align={align}>
      <p className={styles.line}>
        Need help?{" "}
        <TextButton
          ref={trigger}
          aria-expanded={open}
          aria-controls={open ? supportId : undefined}
          onClick={() => setOpen((shown) => !shown)}
        >
          Ask for support
        </TextButton>
      </p>
      {open && createPortal(
        <div
          className={styles.backdrop}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            ref={dialog}
            className={styles.slip}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${supportId}-title`}
            onKeyDown={keepFocusInside}
          >
            <SupportPanel ref={panel} id={supportId} onClose={close} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
