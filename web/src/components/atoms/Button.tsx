import type { ComponentPropsWithRef } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";

type Props = ComponentPropsWithRef<"button"> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ variant = "primary", loading = false, className, disabled, children, ...rest }: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={[styles.button, styles[variant], className].filter(Boolean).join(" ")}
    >
      {loading ? "Working…" : children}
    </button>
  );
}
