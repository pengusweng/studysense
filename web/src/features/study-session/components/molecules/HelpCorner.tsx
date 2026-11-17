"use client";

import { useEffect, useRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import styles from "./HelpCorner.module.css";

/** Help, reachable from every session state. The support options open on a slip of paper over the sheet. */
export function HelpCorner() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  return (
    <div className={styles.corner}>
      <p className={styles.line}>
        Need help?{" "}
        <TextButton
          ref={trigger}
          aria-expanded={open}
          aria-controls="session-support"
          onClick={() => setOpen((o) => !o)}
        >
          Ask for support
        </TextButton>
      </p>
      {open && (
        <div className={styles.slip}>
          <SupportPanel
            ref={panel}
            id="session-support"
            onClose={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          />
        </div>
      )}
    </div>
  );
}
