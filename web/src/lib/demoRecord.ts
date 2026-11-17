import { createSessionValue } from "./sessionValue";

/** Which recorded SSAQS participant-day the demo replays. Chosen with a demo control, never by a device. */
export type DemoRecord = { participant: number; date: string };

/** Replayable days per SSAQS participant, as ISO dates. */
export type DemoDays = Record<number, readonly string[]>;

/** Whether the selected demo record can be replayed. */
export type RecordCheck = "checking" | "available" | "unavailable";

export const DEFAULT_DEMO_RECORD: DemoRecord = { participant: 1, date: "2025-02-24" };

function parse(raw: unknown): DemoRecord | null {
  if (typeof raw !== "object" || raw === null) return null;
  const { participant, date } = raw as Record<string, unknown>;
  if (typeof participant !== "number" || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return { participant, date };
}

const store = createSessionValue<DemoRecord>("studysense.demoRecord", DEFAULT_DEMO_RECORD, parse);

export const useDemoRecordValue = store.useValue;
export const resetDemoRecord = () => store.write(DEFAULT_DEMO_RECORD);

/** "Mon 24 Feb 2025", read as a calendar date with no time zone shift. */
export function formatRecordDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const part = (o: Intl.DateTimeFormatOptions) => date.toLocaleDateString("en-GB", { ...o, timeZone: "UTC" });
  return `${part({ weekday: "short" })} ${d} ${part({ month: "short" })} ${y}`;
}

/** "participant 01" */
export function formatParticipant(n: number): string {
  return `participant ${String(n).padStart(2, "0")}`;
}
