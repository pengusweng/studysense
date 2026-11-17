import Link from "next/link";
import type { ComponentProps } from "react";
import styles from "./Button.module.css";
import type { ButtonVariant } from "./Button";

type Props = ComponentProps<typeof Link> & { variant?: ButtonVariant };

/** A link that looks like a Button. Use it for navigation; use Button for actions. */
export function ButtonLink({ variant = "primary", className, ...rest }: Props) {
  return <Link {...rest} className={[styles.button, styles[variant], className].filter(Boolean).join(" ")} />;
}
