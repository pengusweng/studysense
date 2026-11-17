import { LOOP_STEPS, RULES } from "../../content";
import t from "../../type.module.css";
import { RuleTable } from "../molecules/RuleTable";
import { Spread } from "../molecules/Spread";
import s from "./Sections.module.css";

export function HowItDecidesSpread() {
  return (
    <Spread
      id="how"
      labelledBy="how-title"
      folio={4}
      left={
        <>
          <h2 id="how-title" className={t.title}>
            How it decides
          </h2>
          <ol className={s.steps}>
            {LOOP_STEPS.map((step, i) => (
              <li key={step.title} className={s.step} data-enter style={{ "--i": i } as React.CSSProperties}>
                <h3 className={s.stepTitle}>{step.title}</h3>
                <p className={s.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
          <p className={`${s.loopBack} ${t.pencil}`} data-enter style={{ "--i": LOOP_STEPS.length } as React.CSSProperties}>
            …then back to the first step, with your feedback in hand.
          </p>
        </>
      }
      right={<RuleTable caption="The rules it follows" rules={RULES} />}
    />
  );
}
