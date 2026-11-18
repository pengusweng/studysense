"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { formatParticipant, formatRecordDate, type DemoRecord } from "@/lib/demoRecord";
import type { DemoDays } from "../../types";
import styles from "./RecordPicker.module.css";

type Props = {
  days: DemoDays | null;
  current: DemoRecord;
  onChoose: (record: DemoRecord) => void;
  onCancel: () => void;
};

/** Demo control: choose which recorded participant-day the session replays. */
export function RecordPicker({ days, current, onChoose, onCancel }: Props) {
  const id = useId();
  const firstField = useRef<HTMLSelectElement>(null);
  const [participant, setParticipant] = useState(current.participant);
  const [date, setDate] = useState(current.date);

  useEffect(() => {
    firstField.current?.focus();
  }, [days]);

  if (!days) {
    return (
      <p className={styles.loading} role="status">
        Loading recorded days…
      </p>
    );
  }

  const participants = Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
  const available = days[participant] ?? [];
  const chosenDate = available.includes(date) ? date : available[0];

  function changeParticipant(next: number) {
    setParticipant(next);
    const list = days?.[next] ?? [];
    if (!list.includes(date)) setDate(list[0] ?? "");
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (chosenDate) onChoose({ participant, date: chosenDate });
  }

  return (
    <form className={styles.form} onSubmit={submit} aria-describedby={`${id}-hint`}>
      <div className={styles.field}>
        <label htmlFor={`${id}-p`}>Participant</label>
        <select
          ref={firstField}
          id={`${id}-p`}
          className={styles.select}
          value={participant}
          onChange={(e) => changeParticipant(Number(e.target.value))}
        >
          {participants.map((p) => (
            <option key={p} value={p} disabled={days[p].length === 0}>
              {formatParticipant(p)}
              {days[p].length === 0 ? " (no replayable days)" : ` · ${days[p].length} days`}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.field}>
        <label htmlFor={`${id}-d`}>Recorded day</label>
        <select
          id={`${id}-d`}
          className={styles.select}
          value={chosenDate ?? ""}
          onChange={(e) => setDate(e.target.value)}
          disabled={available.length === 0}
        >
          {available.map((d) => (
            <option key={d} value={d}>
              {formatRecordDate(d)}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.actions}>
        <Button type="submit" variant="secondary" disabled={!chosenDate}>
          Replay this day
        </Button>
        <TextButton onClick={onCancel}>Cancel</TextButton>
      </div>
      <p id={`${id}-hint`} className={styles.hint}>
        Days listed are the ones with recorded activity, heart rate variability or sleep data. Your choice is kept for this visit only.
      </p>
    </form>
  );
}
