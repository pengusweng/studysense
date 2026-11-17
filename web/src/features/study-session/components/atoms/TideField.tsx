import type { SessionPhase } from "../../types";
import styles from "./TideField.module.css";

/**
 * The sheet's ruling, lifted into two layers that drift at different speeds while a session is active.
 * Pausing freezes them mid-drift; ending lets them settle. Pure decoration: hidden from assistive tech, and
 * still under reduced motion. It never reflects any reading, so it cannot pass for live sensing.
 */
export function TideField({ phase }: { phase: SessionPhase }) {
  return (
    <div className={styles.tide} data-phase={phase} aria-hidden="true">
      <div className={`${styles.lines} ${styles.fine}`} />
      <div className={`${styles.lines} ${styles.wide}`} />
    </div>
  );
}
