/** Replayable days per SSAQS participant, as ISO dates. */
export type DemoDays = Record<number, readonly string[]>;

/** Whether the selected demo record can be replayed. */
export type RecordCheck = "checking" | "available" | "unavailable";

/** The panel unfolded from the demo source strip, if any. */
export type StripPanel = "about" | "change" | null;

/** What the Study Session screen shows. */
export type SessionPhase = "ready" | "active" | "paused" | "ended";
