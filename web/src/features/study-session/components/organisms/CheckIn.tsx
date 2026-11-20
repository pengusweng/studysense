"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { TextButton } from "@/components/atoms/TextButton";
import { AnswerList } from "@/components/molecules/AnswerList";
import { SupportPanel } from "@/components/organisms/SupportPanel";
import { recordCheckIn, type CheckInOutcome } from "@/lib/checkIn";
import { useDemoRecordValue } from "@/lib/demoRecord";
import { logEvent } from "@/lib/eventLog";
import { recordFeedback, useFeedbackHistory, type Correction, type FeedbackEntry } from "@/lib/feedback";
import type { SupportId } from "@/lib/supportOptions";
import type { AcademicNeed } from "@/lib/academicSupport";
import { getResponse, type ResponseDecision } from "../../services/responseService";
import type { EstimateView } from "../../types";
import { ResponseNote } from "./ResponseNote";
import styles from "./CheckIn.module.css";

type Answer = "focused" | "swamped";

/** The same two answers as the landing page's check-in; skipping is its own action here. */
const ANSWERS: { id: Answer; label: string }[] = [
  { id: "focused", label: "Focused. Leave me be." },
  { id: "swamped", label: "Swamped. A hand would help." },
];

/** Matches the fold transition in CheckIn.module.css. */
const FOLD_MS = 420;


type Step = "question" | "response" | "said" | "support" | "help" | "closed";
type Offer = Extract<ResponseDecision, { kind: "offer" }>;

type Props = {
  /** The question is still due this session (opted in, not yet asked). */
  due: boolean;
  /** The day's estimate, one input to the response rules (unavailable when the student hid it). */
  estimate: EstimateView;
  /** Where it is asked: on the first pause, or once the session has ended (Preferences). */
  moment?: "pause" | "end";
  /** Called when the check-in is finished and focus should return to the session's controls. */
  onSettled: () => void;
};

export type CheckInHandle = { focus: () => void };

function motionOn() {
  return document.documentElement.dataset.motion === "on";
}

/**
 * The session's one optional question (issue #5), unfolded in place under "Paused." on the first pause, and what
 * follows it: a rule-picked suggestion with Accept, Dismiss and Correct (issue #7), or silence.
 * Every way out is a defined state: an answer, skip, not now, or simply resuming (no response).
 */
export const CheckIn = forwardRef<CheckInHandle, Props>(function CheckIn(
  { due, estimate, moment = "pause", onSettled },
  ref,
) {
  // After the session has ended there is nothing left to stay quiet for.
  const quiet = moment === "pause" ? " StudySense will stay quiet for the rest of this session." : "";
  const id = useId();
  const history = useFeedbackHistory();
  const [record] = useDemoRecordValue();
  const [step, setStep] = useState<Step>("question");
  const [folding, setFolding] = useState(false);
  /** Waiting on the API's response, so an answer can't be sent twice. */
  const [deciding, setDeciding] = useState(false);
  const busy = folding || deciding;
  const [pick, setPick] = useState<Answer | null>(null);
  /** Frozen when shown, so recording feedback can't swap the suggestion mid-fold. */
  const [offer, setOffer] = useState<Offer | null>(null);
  const [corrected, setCorrected] = useState(false);
  /** The one line left behind once the check-in is done. */
  const [said, setSaid] = useState("");
  const [supportIntro, setSupportIntro] = useState<string | null>(null);
  const [supportCategory, setSupportCategory] = useState<AcademicNeed | null>(null);
  const question = useRef<HTMLElement>(null);
  const response = useRef<HTMLElement>(null);
  const support = useRef<HTMLElement>(null);
  const foldTimer = useRef<number | undefined>(undefined);

  useImperativeHandle(ref, () => ({ focus: () => question.current?.focus() }), []);

  useEffect(() => () => window.clearTimeout(foldTimer.current), []);

  useEffect(() => {
    if (step === "support" || step === "help") support.current?.focus();
    if (step === "response") response.current?.focus();
  }, [step, offer]);

  /** Fold the current panel shut, so "Paused." eases back down instead of jumping, then show what follows. */
  function foldTo(next: Step, line = "") {
    onSettled();
    const land = () => {
      setSaid(line);
      setStep(next);
    };
    if (!motionOn()) return land();
    setFolding(true);
    foldTimer.current = window.setTimeout(() => {
      setFolding(false);
      land();
    }, FOLD_MS);
  }

  /** Show what the rules decided. A silent decision leaves one line and folds away. */
  function show(decision: ResponseDecision, quietLine: string, supportLine: string | null) {
    if (decision.kind === "offer") {
      setOffer(decision);
      setStep("response");
    } else if (decision.kind === "support") {
      setSupportIntro(supportLine);
      setSupportCategory(decision.category ?? null);
      setStep("support");
    } else {
      foldTo("said", quietLine);
    }
  }

  /** Kept in this visit's feedback, and logged when the student agreed to check-ins. */
  function feedback(entry: FeedbackEntry) {
    recordFeedback(entry);
    logEvent(record, { kind: "feedback", ...entry });
  }

  async function settle(outcome: Exclude<CheckInOutcome, "no_response">) {
    // Recorded at once, so resuming mid-fold can't count as no response.
    recordCheckIn(outcome);
    logEvent(record, { kind: "check_in", checkIn: outcome });
    if (outcome === "skipped" || outcome === "dismissed") return foldTo("closed");
    setDeciding(true);
    const decision = await getResponse({ estimate, checkIn: outcome, history });
    setDeciding(false);
    show(decision, `Noted.${quiet}`, null);
  }

  function accept(suggestion: SupportId) {
    feedback({ suggestion, action: "accept" });
    foldTo("said", "Noted. More support is in the corner whenever you want it.");
  }

  function dismiss(suggestion: SupportId) {
    feedback({ suggestion, action: "dismiss" });
    foldTo("closed");
  }

  async function correct(suggestion: SupportId, correction: Correction) {
    feedback({ suggestion, action: "correct", correction });
    setCorrected(true);
    setDeciding(true);
    const decision = await getResponse({ estimate, checkIn: "swamped", correction, history });
    setDeciding(false);
    show(decision, `Thanks, that’s noted.${quiet}`, "Thanks, that’s noted. Here is everything on offer.");
  }

  if (step === "said") {
    return (
      <p className={styles.noted} role="status">
        {said}
      </p>
    );
  }

  if (step === "response" && offer) {
    return (
      <div className={styles.fold} data-folding={folding || undefined}>
        <ResponseNote
          key={`${offer.suggestion}-${offer.basis}`}
          ref={response}
          offer={offer}
          canCorrect={!corrected}
          disabled={busy}
          onAccept={accept}
          onDismiss={dismiss}
          onCorrect={correct}
          onOtherOptions={() => {
            setSupportIntro(null);
            setSupportCategory(null);
            setStep("support");
          }}
        />
      </div>
    );
  }

  if (step === "support" || step === "help") {
    return (
      <div className={styles.fold} data-folding={folding || undefined}>
        <div className={styles.support}>
          {supportIntro && step === "support" && <p className={styles.intro}>{supportIntro}</p>}
          <SupportPanel
            ref={support}
            id={`${id}-support`}
            initialCategory={supportCategory}
            onClose={() => foldTo("closed")}
          />
        </div>
      </div>
    );
  }

  // Kept on screen while the response is decided: the check-in is recorded before the answer arrives.
  if (step === "closed" || (!due && !busy)) return null;

  return (
    <div className={styles.fold} data-folding={folding || undefined}>
      <section
        ref={question}
        className={styles.checkIn}
        tabIndex={-1}
        aria-label="Optional check-in"
        onKeyDown={(e) => {
          if (e.key !== "Escape" || busy) return;
          e.stopPropagation();
          settle("dismissed");
        }}
      >
        <AnswerList
          question={moment === "end" ? "How did studying go?" : "How is studying going?"}
          hint="Optional. Your answer stays in this browser visit; it is not used to infer your emotions."
          options={ANSWERS}
          value={pick}
          onChange={setPick}
        />
        <div className={styles.actions}>
          <Button
            variant="secondary"
            disabled={!pick || busy}
            aria-describedby={pick ? undefined : `${id}-reason`}
            onClick={() => pick && settle(pick)}
          >
            Answer
          </Button>
          <TextButton onClick={() => settle("skipped")} disabled={busy}>
            Skip this question
          </TextButton>
        </div>
        {/* Kept in place once answered, so picking doesn't shift the page. */}
        <p id={`${id}-reason`} className={styles.reason} data-hidden={pick ? true : undefined} aria-hidden={pick ? true : undefined}>
          Pick an answer, or skip it.
        </p>
        <p className={styles.help}>
          Rather have support now?{" "}
          <TextButton onClick={() => setStep("help")} disabled={busy}>
            Ask for help
          </TextButton>
        </p>
        {/* Last in reading order, so the question comes first; shown at the top corner, where a note is set aside. */}
        <TextButton className={styles.dismiss} onClick={() => settle("dismissed")} disabled={busy}>
          Not now
        </TextButton>
      </section>
    </div>
  );
});
