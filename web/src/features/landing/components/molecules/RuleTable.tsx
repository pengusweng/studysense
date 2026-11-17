import type { Rule } from "../../types";
import styles from "./RuleTable.module.css";

/** Situation → behaviour rules, as a ruled two-column table. Rows settle in as the spread opens. */
export function RuleTable({ caption, rules }: { caption: string; rules: Rule[] }) {
  return (
    <table className={styles.table}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">When</th>
          <th scope="col">StudySense</th>
        </tr>
      </thead>
      <tbody>
        {rules.map((rule, i) => (
          <tr key={rule.when} data-enter style={{ "--i": i + 1 } as React.CSSProperties}>
            <th scope="row">{rule.when}</th>
            <td>{rule.then}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
