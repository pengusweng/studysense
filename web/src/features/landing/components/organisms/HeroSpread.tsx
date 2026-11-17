import { ButtonLink } from "@/components/atoms/ButtonLink";
import { CHECK_IN_OPTIONS, DEMO_DAY, READINGS } from "../../content";
import type { CheckInAnswer, Outcome } from "../../types";
import t from "../../type.module.css";
import { Hand } from "@/components/atoms/Hand";
import { AnswerList } from "@/components/molecules/AnswerList";
import { LogTable } from "@/components/molecules/LogTable";
import { Readings } from "../molecules/Readings";
import { Spread } from "@/components/molecules/Spread";
import styles from "./HeroSpread.module.css";

type Props = {
  answer: CheckInAnswer | null;
  outcome: Outcome;
  onAnswer: (answer: CheckInAnswer) => void;
  onReset: () => void;
};

export function HeroSpread({ answer, outcome, onAnswer, onReset }: Props) {
  const observation = (
    <>
      <div className={`${styles.provenance} ${t.log}`} data-enter style={{ "--i": 0 } as React.CSSProperties}>
        <span>{DEMO_DAY.source}</span>
        <time dateTime={DEMO_DAY.dateTime}>{DEMO_DAY.date}</time>
      </div>
      <p className={`${styles.provenanceNote} ${t.log} ${t.pencil}`}>Replayed from the dataset. Not live, not you.</p>

      <h2 className={styles.logTitle}>Everything the wearable recorded about that Monday</h2>
      <LogTable rows={DEMO_DAY.rows} label="Recorded values" noteDelay={1500} />

      {/* On wide screens the readings sit opposite the check-in; on phones they move next to it (see below). */}
      <Readings readings={READINGS} ruledOut={outcome.ruledOut} className={styles.readingsWide} />
      <p className={`${t.prose} ${t.pencil} ${styles.because}`}>
        A sensor can tell that something changed. It can’t tell why. So StudySense asks you.
      </p>
    </>
  );

  const interpretation = (
    <>
      <h1 id="hero-title" className={t.display}>
        The data is a lead. You write the conclusion.
      </h1>
      <p className={t.lede}>
        A study companion that reads wearable data as evidence, not feelings. It asks before it assumes, and it’s
        allowed to say nothing.
      </p>

      <AnswerList
        question="Try it: how is studying going?"
        hint="Just a preview. Pick one to see what the app would do. Nothing is saved."
        options={CHECK_IN_OPTIONS}
        value={answer}
        onChange={onAnswer}
      />

      <Readings readings={READINGS} ruledOut={outcome.ruledOut} compact className={styles.readingsNarrow} />

      <div className={styles.interp} aria-live="polite">
        <p className={styles.line}>
          <span className={`${styles.lineLabel} ${t.pencil}`}>Your reading</span>
          {outcome.hand ? (
            <span className={styles.lineHand}>
              <Hand key={answer ?? "none"} writeOn>
                {outcome.hand}
              </Hand>
            </span>
          ) : (
            <span className={`${styles.lineEmpty} ${t.pencil}`}>{answer === "skip" ? "left blank" : "not written yet"}</span>
          )}
        </p>
        <p className={styles.response}>{outcome.response}</p>
        <p className={`${styles.note} ${t.pencil}`}>{outcome.note}</p>
      </div>

      <div className={styles.actions}>
        <ButtonLink href="/dashboard">Open the demo</ButtonLink>
        <a href="#how">See how it decides</a>
        {answer && (
          <button type="button" className={styles.erase} onClick={onReset}>
            Erase my answer
          </button>
        )}
      </div>
    </>
  );

  return <Spread labelledBy="hero-title" left={observation} right={interpretation} rightFirst intro folio={2} />;
}
