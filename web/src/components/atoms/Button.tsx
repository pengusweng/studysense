import type { ComponentPropsWithRef } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";

type Props = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

/** Actions in Deep Iris. `loading` keeps the button's look, blocks a second press, and says it is working. */
export function Button({ variant = "primary", loading = false, className, disabled, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
    >
      {loading ? (
        <>
          Working
          {/* Three dots written in turn, slowly: busy, never a meter or a spinner. */}
          <span className={styles.dots} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
