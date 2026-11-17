import { profileByCode, type ProfileCode } from "@/lib/profiles";
import styles from "./ProfileMark.module.css";

type Props = {
  /** The cell to mark, or none when the day could not be placed. */
  profile?: ProfileCode;
  certainty?: "confident" | "uncertain";
};

/**
 * A thumbnail of the landing page's profile plot: anxiety rises upward, stress runs right, split at 50.
 * A confident estimate fills its cell; an uncertain one is only pencilled round; an empty grid places nothing.
 * Geometry only, no numbers. Decorative: the sentence beside it says the same in words.
 */
export function ProfileMark({ profile, certainty = "confident" }: Props) {
  const p = profile ? profileByCode(profile) : null;
  const x = p?.stress === "higher" ? 24 : 4;
  const y = p?.anxiety === "higher" ? 4 : 24;

  return (
    <svg className={styles.mark} viewBox="0 0 44 44" aria-hidden="true" focusable="false" data-certainty={certainty}>
      <rect className={styles.frame} x="0.75" y="0.75" width="42.5" height="42.5" rx="2" />
      <path className={styles.split} d="M22 1v42M1 22h42" />
      {p && <rect className={styles.cell} x={x} y={y} width="16" height="16" rx="1.5" />}
    </svg>
  );
}
