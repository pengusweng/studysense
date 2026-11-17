"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Sheet } from "@/components/molecules/Sheet";
import { TextButton } from "@/components/atoms/TextButton";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import styles from "./PlannedScreen.module.css";

type Props = { title: string; issue: string; children: ReactNode };

/**
 * An honest placeholder for a destination that is designed but not built yet. It says so plainly,
 * keeps help reachable, and points back to the Dashboard.
 */
export function PlannedScreen({ title, issue, children }: Props) {
  const [helpOpen, setHelpOpen] = useState(false);
  const helpBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useEffect(() => {
    if (helpOpen) panel.current?.focus();
  }, [helpOpen]);

  return (
    <Sheet>
      <div className={styles.body}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.text}>
          {children}
          <p>It hasn&rsquo;t been built yet ({issue}).</p>
        </div>
        <p className={styles.links}>
          <Link href="/dashboard">Back to the Dashboard</Link>
          <span>
            Need help now?{" "}
            <TextButton
              ref={helpBtn}
              aria-expanded={helpOpen}
              aria-controls="planned-support"
              onClick={() => setHelpOpen((o) => !o)}
            >
              Ask for support.
            </TextButton>
          </span>
        </p>
        {helpOpen && (
          <SupportPanel
            ref={panel}
            id="planned-support"
            onClose={() => {
              setHelpOpen(false);
              helpBtn.current?.focus();
            }}
          />
        )}
      </div>
    </Sheet>
  );
}
