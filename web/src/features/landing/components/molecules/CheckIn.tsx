import { useId } from "react";
import type { CheckInAnswer } from "../../types";
import styles from "./CheckIn.module.css";

type Props = {
  question: string;
  /** Short context shown under the question and announced with it. */
  hint?: string;
  options: { id: CheckInAnswer; label: string }[];
  value: CheckInAnswer | null;
  onChange: (answer: CheckInAnswer) => void;
};

/**
 * A neutral, skippable check-in: one question, a few plain answers, nothing preselected.
 * Set as a notebook answer list; the chosen answer gets circled in the student's ink.
 */
export function CheckIn({ question, hint, options, value, onChange }: Props) {
  const name = useId();
  const hintId = `${name}-hint`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={hint ? hintId : undefined}>
      <legend className={styles.legend}>{question}</legend>
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      <div className={styles.options}>
        {options.map((option) => (
          <label key={option.id} className={styles.option}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
            />
            <span className={styles.label}>
              {option.label}
              <svg className={styles.circle} viewBox="0 0 200 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path d="M18 7 C 60 1, 150 1, 188 9 C 204 14, 198 32, 170 36 C 120 41, 50 40, 16 33 C -2 28, 2 10, 30 6" />
              </svg>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
