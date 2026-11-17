import { createSessionValue } from "./sessionValue";

/**
 * Where the student's study session stands, shared between the Dashboard (which offers start or resume)
 * and the Study Session (which owns the session). Kept for this visit only.
 */
export type SessionStatus = "none" | "active" | "paused" | "ended";

const STATUSES: readonly SessionStatus[] = ["none", "active", "paused", "ended"];

const store = createSessionValue<SessionStatus>("studysense.sessionStatus", "none", (raw) =>
  STATUSES.includes(raw as SessionStatus) ? (raw as SessionStatus) : null,
);

export const useSessionStatusValue = store.useValue;
export const useKnownSessionStatus = store.useKnownValue;
export const setSessionStatus = store.write;
