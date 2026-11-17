import { useId } from "react";
import styles from "./AnswerList.module.css";

type Props<T extends string> = {
  question: string;
  /** Short context shown under the question and announced with it. */
  hint?: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (answer: T) => void;
  /** Not applicable right now; the hint should say why. */
  disabled?: boolean;
};

/**
 * One neutral question with a few plain answers and nothing preselected, set as a notebook answer list.
 * The chosen answer is circled in the student's ink (Iris). Used by the landing check-in and setup.
 */
export function AnswerList<T extends string>({ question, hint, options, value, onChange, disabled }: Props<T>) {
  const name = useId();
  const hintId = `${name}-hint`;

  return (
    <fieldset className={styles.fieldset} aria-describedby={hint ? hintId : undefined} disabled={disabled}>
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
