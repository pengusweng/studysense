import { createSessionValue } from "./sessionValue";

/**
 * The student's preferences (issue #7), for this visit only like every other choice (docs/AGENTS.md §14.7).
 * Whether check-ins happen at all is the setup choice in consent.ts; these refine it.
 */
export type AskWhen = "pause" | "end";
export type Preferences = {
  /** When the optional check-in may appear: the first pause, or only once a session has ended. */
  askWhen: AskWhen;
  /** Whether the day's estimate shows on the ready screen. */
  showEstimate: boolean;
};

export const DEFAULT_PREFERENCES: Preferences = { askWhen: "pause", showEstimate: true };

const store = createSessionValue<Preferences>("studysense.preferences", DEFAULT_PREFERENCES, (raw) => {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if ((r.askWhen !== "pause" && r.askWhen !== "end") || typeof r.showEstimate !== "boolean") return null;
  return { askWhen: r.askWhen, showEstimate: r.showEstimate };
});

export function usePreferences(): Preferences {
  return store.useValue()[0];
}

/** Null until the browser's value is known, for screens that must not flash a default. */
export const useKnownPreferences = store.useKnownValue;
export const readPreferences = store.read;

export function setPreferences(patch: Partial<Preferences>) {
  store.write({ ...store.read(), ...patch });
}

export function resetPreferences() {
  store.write(DEFAULT_PREFERENCES);
}
