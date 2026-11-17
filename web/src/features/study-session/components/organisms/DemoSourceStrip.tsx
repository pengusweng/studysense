"use client";

import { useEffect, useRef, useState } from "react";
import { TextButton } from "@/components/atoms/TextButton";
import { formatParticipant, formatRecordDate, type DemoRecord } from "@/lib/demoRecord";
import { DemoTag } from "../atoms/DemoTag";
import { RecordPicker } from "../molecules/RecordPicker";
import type { DemoDays, RecordCheck, StripPanel } from "../../types";
import styles from "./DemoSourceStrip.module.css";

type Props = {
  record: DemoRecord;
  check: RecordCheck;
  days: DemoDays | null;
  onChoose: (record: DemoRecord) => void;
};

/**
 * The sheet's first line: where the data comes from, said before anything else. Its two controls unfold
 * their panels in place under the strip rather than opening a modal.
 */
export function DemoSourceStrip({ record, check, days, onChoose }: Props) {
  const [panel, setPanel] = useState<StripPanel>(null);
  const aboutRef = useRef<HTMLButtonElement>(null);
  const changeRef = useRef<HTMLButtonElement>(null);
  const aboutPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panel === "about") aboutPanel.current?.focus();
  }, [panel]);

  function close(from: StripPanel) {
    setPanel(null);
    (from === "change" ? changeRef : aboutRef).current?.focus();
  }

  const source = `SSAQS ${formatParticipant(record.participant)} · ${formatRecordDate(record.date)}`;

  return (
    <div className={styles.wrap}>
      <div className={styles.strip}>
        <p className={styles.source} role="status">
          <span>Demo mode</span>
          {check === "checking" ? (
            <span className={styles.pencil}>Loading demo record…</span>
          ) : (
            <span>{source}</span>
          )}
          {check === "available" && <span className={styles.pencil}>replayed, not live</span>}
          {check === "unavailable" && (
            <span className={styles.warn}>unavailable</span>
          )}
        </p>
        <div className={styles.controls}>
          <TextButton
            ref={aboutRef}
            aria-expanded={panel === "about"}
            aria-controls="demo-about"
            onClick={() => setPanel(panel === "about" ? null : "about")}
          >
            What does this mean?
          </TextButton>
          <span className={styles.change}>
            <TextButton
              ref={changeRef}
              aria-expanded={panel === "change"}
              aria-controls="demo-change"
              onClick={() => setPanel(panel === "change" ? null : "change")}
            >
              Change demo record
            </TextButton>
            <DemoTag />
          </span>
        </div>
      </div>

      {panel === "about" && (
        <div
          ref={aboutPanel}
          id="demo-about"
          tabIndex={-1}
          className={styles.panel}
          role="region"
          aria-labelledby="demo-about-title"
          onKeyDown={(e) => e.key === "Escape" && close("about")}
        >
          <h2 id="demo-about-title" className={styles.panelTitle}>
            About demo mode
          </h2>
          <div className={styles.about}>
            <p>
              No watch is paired, and nothing is measured from you. Each session replays one recorded day from the
              SSAQS dataset, which holds Fitbit readings and questionnaires from university students who took part in a
              published study.
            </p>
            <p>
              The readings belong to that participant, not to you. Anything StudySense suggests from them is tentative,
              and you can correct or ignore it.
            </p>
            <p className={styles.pencil}>Your choices last for this visit only.</p>
          </div>
          <TextButton onClick={() => close("about")}>Close</TextButton>
        </div>
      )}

      {panel === "change" && (
        <div
          id="demo-change"
          className={styles.panel}
          role="region"
          aria-labelledby="demo-change-title"
          onKeyDown={(e) => e.key === "Escape" && close("change")}
        >
          <h2 id="demo-change-title" className={styles.panelTitle}>
            Change demo record
          </h2>
          <RecordPicker
            days={days}
            current={record}
            onChoose={(next) => {
              onChoose(next);
              close("change");
            }}
            onCancel={() => close("change")}
          />
        </div>
      )}
    </div>
  );
}
