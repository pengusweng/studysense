import type { CheckInAnswer, LogRow, Outcome, Profile, Reading, Rule } from "./types";

/**
 * One real participant-day from the SSAQS dataset (etl/data/raw/SSAQS dataset/1, 2025-02-24).
 * Values computed from the raw CSVs: steps summed, RMSSD averaged over valid 5-minute windows.
 */
export const DEMO_DAY = {
  source: "SSAQS · participant 01",
  date: "Mon 24 Feb 2025",
  dateTime: "2025-02-24",
  rows: [
    { label: "Sleep score", value: "85 / 100" },
    { label: "Deep sleep", value: "78 min" },
    { label: "Steps", value: "4,875" },
    { label: "Mean HRV (RMSSD)", value: "71.4 ms" },
    { label: "Fitbit stress score", value: "71", handNote: "higher is calmer!", highlight: true },
  ] satisfies LogRow[],
};

export const READINGS: { id: Reading; label: string }[] = [
  { id: "stress", label: "stress?" },
  { id: "focus", label: "deep focus?" },
  { id: "walk", label: "a walk across campus?" },
];

export const CHECK_IN_OPTIONS: { id: CheckInAnswer; label: string }[] = [
  { id: "focused", label: "Focused. Leave me be." },
  { id: "swamped", label: "Swamped. A hand would help." },
  { id: "skip", label: "Skip this" },
];

export const IDLE_OUTCOME: Outcome = {
  hand: "",
  response: "Answer, skip, or ignore it. Every one of those is a valid outcome.",
  ruledOut: [],
};

export const OUTCOMES: Record<CheckInAnswer, Outcome> = {
  focused: {
    hand: "focused, actually",
    response: "StudySense stays quiet for the rest of the session. Nothing pops up.",
    ruledOut: ["stress", "walk"],
  },
  swamped: {
    hand: "yes, swamped",
    response: "Want to break the next task into smaller steps, or take a short break first?",
    note: "You can accept, dismiss, or correct the suggestion.",
    ruledOut: ["focus", "walk"],
  },
  skip: {
    hand: "",
    response: "Skipped. No warning, no penalty. The session carries on.",
    ruledOut: [],
  },
};

export const LOOP_STEPS: { title: string; body: string }[] = [
  {
    title: "Replay a day",
    body: "A recorded SSAQS participant-day stands in for the wearable. Nothing is sensed live.",
  },
  {
    title: "Estimate, tentatively",
    body: "A model suggests one of four daily profiles. It may be wrong, and the app says so.",
  },
  {
    title: "Ask, if it helps",
    body: "At a natural pause, a short optional check-in. Skipping costs nothing.",
  },
  {
    title: "Respond, or don’t",
    body: "Rules pick from fixed templates: offer help, ask a clarifying question, suggest a break, or stay silent.",
  },
  {
    title: "Let the student have the last word",
    body: "Accept, dismiss, or correct. That feedback can inform what it chooses next time.",
  },
];

export const RULES: Rule[] = [
  {
    when: "The estimate looks elevated and you say you’re overwhelmed",
    then: "Offers optional support: smaller steps, or a short break.",
  },
  {
    when: "The estimate looks elevated but you say you’re focused",
    then: "Says nothing. Your flow wins.",
  },
  {
    when: "The evidence is missing, uncertain, or contradictory",
    then: "Asks, waits, or holds back. The least intrusive option.",
  },
  {
    when: "You ask for help",
    then: "Helps, whatever the estimate says, and even when there is none.",
  },
  {
    when: "You dismiss a suggestion",
    then: "The session carries on. The same prompt doesn’t come back.",
  },
  {
    when: "You’ve asked for fewer interruptions",
    then: "Stays quiet.",
  },
];

export const PROFILES: Profile[] = [
  { code: "LSHA", name: "Lower stress, higher anxiety", stress: "lower", anxiety: "higher" },
  { code: "HSHA", name: "Higher stress, higher anxiety", stress: "higher", anxiety: "higher" },
  { code: "LSLA", name: "Lower stress, lower anxiety", stress: "lower", anxiety: "lower" },
  { code: "HSLA", name: "Higher stress, lower anxiety", stress: "higher", anxiety: "lower" },
];

export const DATA_FACTS: LogRow[] = [
  { label: "Dataset", value: "SSAQS" },
  { label: "Participants", value: "35 university students" },
  { label: "Period", value: "Feb – Jul 2025" },
  { label: "Wearable", value: "Fitbit Inspire 3" },
  { label: "Signals", value: "steps, activity, HRV, SpO₂, sleep, daily stress score" },
  { label: "Self-reports", value: "daily stress and anxiety, 0–100" },
  { label: "Participant-days", value: "3,618" },
  { label: "With sensors and labels", value: "2,291" },
];

export const BOUNDARIES: string[] = [
  "Diagnose you, or call a profile a feeling",
  "Pretend a watch is connected",
  "Interrupt because one number moved",
  "Make you answer before you can keep studying",
  "Write its replies with a language model",
  "Claim it has learned from you",
];
