export type { DemoDays, RecordCheck } from "@/lib/demoRecord";

/** The panel unfolded from the demo source note, if any. */
export type NotePanel = "about" | "change" | null;

/** What the Study Session screen shows. */
export type SessionPhase = "ready" | "active" | "paused" | "ended";
