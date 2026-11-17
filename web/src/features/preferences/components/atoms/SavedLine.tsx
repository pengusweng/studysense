import styles from "./SavedLine.module.css";

export type Saved = { text: string; tick: number } | null;

/**
 * A quiet confirmation under the section that just changed. The region is always present so it is announced,
 * and each change remounts the line (keyed by tick) so it fades in again.
 */
export function SavedLine({ saved }: { saved: Saved }) {
  return (
    <p className={styles.saved} role="status">
      {saved && (
        <span key={saved.tick} className={styles.text}>
          {saved.text}
        </span>
      )}
    </p>
  );
}
