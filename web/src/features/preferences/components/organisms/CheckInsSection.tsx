import { AnswerList } from "@/components/molecules/AnswerList";
import type { CheckInsChoice } from "@/lib/consent";
import type { AskWhen } from "@/lib/preferences";
import { SavedLine, type Saved } from "../atoms/SavedLine";
import styles from "./Preferences.module.css";

const CHECK_INS: { id: CheckInsChoice; label: string }[] = [
  { id: "yes", label: "Yes, now and then" },
  { id: "no", label: "No, keep quiet" },
];

const WHEN: { id: AskWhen; label: string }[] = [
  { id: "pause", label: "At my first pause" },
  { id: "end", label: "Only after I end a session" },
];

type Props = {
  checkIns: CheckInsChoice | null;
  askWhen: AskWhen;
  onCheckIns: (value: CheckInsChoice) => void;
  onAskWhen: (value: AskWhen) => void;
  saved: Saved;
};

/** Whether StudySense may ask its one optional question, and when. The first is the same choice as in setup. */
export function CheckInsSection({ checkIns, askWhen, onCheckIns, onAskWhen, saved }: Props) {
  return (
    <section className={styles.section} aria-labelledby="prefs-checkins">
      <h2 id="prefs-checkins" className={styles.heading}>
        Check-ins
      </h2>
      <AnswerList
        question="During a session, may StudySense ask an occasional optional question?"
        hint={
          checkIns
            ? "At most once a session, and you can always skip it."
            : "At most once a session, and you can always skip it. Not chosen yet."
        }
        options={CHECK_INS}
        value={checkIns}
        onChange={onCheckIns}
      />
      <AnswerList
        question="When may it ask?"
        hint={
          checkIns === "yes"
            ? "Pick the end of a session if you’d rather never be asked while studying. Default: at my first pause."
            : "Applies only when check-ins are on."
        }
        options={WHEN}
        value={askWhen}
        onChange={onAskWhen}
        disabled={checkIns !== "yes"}
      />
      <SavedLine saved={saved} />
    </section>
  );
}
