import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { AnswerList } from "@/components/molecules/AnswerList";
import { HelpCorner } from "@/components/molecules/HelpCorner";
import type { CheckInsChoice } from "@/lib/consent";
import styles from "./SetupPages.module.css";

type Props = {
  value: CheckInsChoice | null;
  onChange: (value: CheckInsChoice) => void;
  onConfirm: () => void;
  onBack: () => void;
  /** Setup was finished before; this visit only reviews or changes it. */
  reopened: boolean;
  /** False when the browser blocks storage, so the choice lasts for this page only. */
  storageOk: boolean;
};

const OPTIONS: { id: CheckInsChoice; label: string }[] = [
  { id: "yes", label: "Yes, now and then" },
  { id: "no", label: "No, keep quiet" },
];

/** The right page: the student's one choice. Neutral wording, nothing preselected, and "no" is a full answer. */
export function ChoicePage({ value, onChange, onConfirm, onBack, reopened, storageOk }: Props) {
  return (
    <>
      <h2 className={styles.title} data-enter>
        One choice
      </h2>
      <div data-enter>
        <AnswerList
          question="During a session, may StudySense ask an occasional optional question?"
          hint="You can skip any question it asks, and change this later in Preferences."
          options={OPTIONS}
          value={value}
          onChange={onChange}
        />
      </div>
      <p className={styles.prose} data-enter>
        Either way, you can study, pause, end a session and ask for help.
      </p>

      <div className={styles.actions} data-enter>
        <Button onClick={onConfirm} disabled={!value} aria-describedby={value ? undefined : "setup-reason"}>
          {reopened ? "Done" : "Continue to the Dashboard"}
        </Button>
        <TextButton onClick={onBack}>Back</TextButton>
      </div>
      {!value && (
        <p id="setup-reason" className={styles.reason}>
          Pick one to continue.
        </p>
      )}
      <p className={styles.note}>
        {storageOk ? "Your choices last for this visit only." : "Your choice lasts for this page only."}
      </p>

      <div className={styles.help}>
        <HelpCorner align="start" />
      </div>
    </>
  );
}
