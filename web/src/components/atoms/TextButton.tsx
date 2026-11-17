import { forwardRef, type ButtonHTMLAttributes } from "react";
import styles from "./TextButton.module.css";

/** An action set as underlined text in Deep Iris: for secondary actions that sit inside a sentence or a strip. */
export const TextButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function TextButton(
  { className, type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={[styles.text, className].filter(Boolean).join(" ")} {...rest} />;
});
