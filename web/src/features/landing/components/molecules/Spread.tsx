import type { ReactNode } from "react";
import styles from "./Spread.module.css";

type Props = {
  id?: string;
  labelledBy: string;
  left: ReactNode;
  right: ReactNode;
  /** Put the right page first in the DOM (it holds the section's main heading) while keeping it on the right visually. */
  rightFirst?: boolean;
  /** The first spread: sits flush under the header tabs and opens on page load instead of on scroll. */
  intro?: boolean;
  /** Page number of the left page. The right page is folio + 1. */
  folio: number;
};

/** One open notebook spread: two graph-ruled pages on a single inked gutter. Stacks on narrow screens. */
export function Spread({ id, labelledBy, left, right, rightFirst = false, intro = false, folio }: Props) {
  const leftPage = (
    <div key="l" className={`${styles.page} ${styles.left}`}>
      {left}
      <span className={`${styles.folio} ${styles.folioLeft}`} aria-hidden="true">
        {folio}
      </span>
    </div>
  );
  const rightPage = (
    <div key="r" className={`${styles.page} ${styles.right}`}>
      {right}
      <span className={`${styles.folio} ${styles.folioRight}`} aria-hidden="true">
        {folio + 1}
      </span>
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${styles.section} ${intro ? styles.intro : ""}`}
      data-reveal={intro ? undefined : ""}
    >
      <div className={styles.spread}>{rightFirst ? [rightPage, leftPage] : [leftPage, rightPage]}</div>
    </section>
  );
}
