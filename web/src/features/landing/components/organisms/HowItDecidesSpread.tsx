import { LOOP_STEPS, PROFILES } from "../../content";
import t from "../../type.module.css";
import { ProfileGrid } from "../molecules/ProfileGrid";
import { Spread } from "@/components/molecules/Spread";
import s from "./Sections.module.css";

/** The loop on the left; the four profiles its estimate can land on, on the right. */
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
            …then back to step 1, with your feedback.
          </p>
        </>
      }
      right={
        <ProfileGrid
          profiles={PROFILES}
          caption="The estimate is one of four whole-day profiles, split at 50 on the 0–100 self-report scales (a course choice, not a clinical line). It may be wrong; the app says what it’s based on, and you can correct it."
        />
      }
    />
  );
}
