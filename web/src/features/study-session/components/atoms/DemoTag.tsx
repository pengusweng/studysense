import styles from "./DemoTag.module.css";

/** Marks a control as a demo/operator control, so it is never mistaken for connecting a device. */
export function DemoTag() {
  return <span className={styles.tag}>demo control</span>;
}
