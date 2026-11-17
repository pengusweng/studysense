"use client";

import { setTheme, useTheme } from "@/lib/theme";
import { Tooltip } from "./Tooltip";
import styles from "./ThemeToggle.module.css";

/**
 * A small switch on the desk beside the wordmark. It is an action, so it is drawn in Deep Iris; the knob
 * slides to say which theme is on. Before hydration it renders unset, then settles on the real theme.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const dark = theme === "dark";

  return (
    // On phones the label is hidden; the tooltip says it instead. Its name already says "Dark mode", so the
    // tip isn't also announced as a description.
    <Tooltip text="Dark mode" describe={false} className={className} tipClassName={styles.tip} align="end">
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark mode"
      className={styles.toggle}
      data-ready={theme !== null || undefined}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.knob} />
      </span>
      <span className={styles.label} aria-hidden="true">
        Dark mode
      </span>
    </button>
    </Tooltip>
  );
}
