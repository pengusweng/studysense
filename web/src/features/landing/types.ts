export type CheckInAnswer = "focused" | "swamped" | "skip";

export type Reading = "stress" | "focus" | "walk";

export type Outcome = {
  /** What the student writes on the interpretation line (rendered in hand). Empty for none/skip. */
  hand: string;
  /** What StudySense does in response (printed). */
  response: string;
  /** Extra printed line under the response, if any. */
  note?: string;
  /** Which of the possible readings the student's answer rules out. */
  ruledOut: Reading[];
};

export type LogRow = {
  label: string;
  value: string;
  /** Printed note under the value. */
  note?: string;
  /** The student's hand-written margin note (Iris ink). */
  handNote?: string;
  highlight?: boolean;
};


export type Profile = { code: string; name: string; stress: "lower" | "higher"; anxiety: "lower" | "higher" };
