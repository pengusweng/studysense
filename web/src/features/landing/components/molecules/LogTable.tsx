import type { LogRow } from "../../types";
import { Hand } from "../atoms/Hand";
import { Highlight } from "../atoms/Highlight";
import styles from "./LogTable.module.css";

type Props = {
  rows: LogRow[];
  label?: string;
  /** Delay (ms) before hand-written margin notes are inked, so they follow the rows. */
  noteDelay?: number;
};

/** Label / value rows set in the log face with dotted leaders. Rows write in left to right when revealed. */
export function LogTable({ rows, label, noteDelay = 0 }: Props) {
  return (
    <dl className={styles.list} aria-label={label}>
      {rows.map((row, i) => (
        <div key={row.label} className={styles.row} data-enter="write" style={{ "--i": i } as React.CSSProperties}>
          <dt>{row.label}</dt>
          <dd>
            {row.highlight ? <Highlight>{row.value}</Highlight> : row.value}
            {row.note && <span className={styles.note}>{row.note}</span>}
            {row.handNote && (
              <span className={styles.handNote}>
                <Hand writeOn delay={noteDelay}>
                  {row.handNote}
                </Hand>
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
