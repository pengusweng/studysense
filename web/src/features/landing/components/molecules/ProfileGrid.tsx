import type { Profile } from "../../types";
import styles from "./ProfileGrid.module.css";

/** The four daily profiles plotted on the stress × anxiety plane, split at 50. Geometry only; no data points. */
export function ProfileGrid({ profiles, caption }: { profiles: Profile[]; caption: string }) {
  return (
    <figure className={styles.figure}>
      <div className={styles.plot}>
        <div className={styles.yAxis} aria-hidden="true">
          <span>0</span>
          <span className={styles.axisName}>anxiety</span>
          <span>100</span>
        </div>
        <ul className={styles.quadrants}>
          {profiles.map((p, i) => (
            <li key={p.code} className={styles.quadrant} style={{ "--i": i } as React.CSSProperties}>
              <span className={styles.code}>{p.code}</span>
              <span className={styles.name}>{p.name}</span>
            </li>
          ))}
        </ul>
        <div className={styles.xAxis} aria-hidden="true">
          <span>0</span>
          <span className={styles.axisName}>stress</span>
          <span>100</span>
        </div>
      </div>
      <figcaption className={styles.caption}>{caption}</figcaption>
    </figure>
  );
}
