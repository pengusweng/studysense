"use client";

import { useEffect, useRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import styles from "./HelpCorner.module.css";

/**
 * "Need help? Ask for support", reachable everywhere (docs/AGENTS.md §2 rule 8). The support options open on a
 * slip of paper over the page. `align` sets which edge the line and its slip hang from.
 */
export function HelpCorner({ align = "end" }: { align?: "start" | "end" }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (open) panel.current?.focus();
  }, [open]);

  return (
    <div className={styles.corner} data-align={align}>
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
