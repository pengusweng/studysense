import type { Reading } from "../../types";
import { Strike } from "../atoms/Strike";
import styles from "./Readings.module.css";

type Props = {
  readings: { id: Reading; label: string }[];
  ruledOut: Reading[];
  compact?: boolean;
  className?: string;
};

/** What a day of data could mean. The student's answer strikes out the readings that don't apply. */
export function Readings({ readings, ruledOut, compact = false, className }: Props) {
  return (
    <div className={[styles.readings, compact && styles.compact, className].filter(Boolean).join(" ")}>
      <p className={styles.label}>A day like this could mean</p>
      <ul className={styles.list}>
        {readings.map((r) => (
          <li key={r.id}>
            <Strike struck={ruledOut.includes(r.id)}>{r.label}</Strike>
          </li>
        ))}
      </ul>
    </div>
  );
}
