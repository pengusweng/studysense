import { createSessionValue } from "./sessionValue";

/**
 * What the student agreed to in setup (issue #3). Only one choice exists: whether StudySense may ask an
 * occasional optional question during a session. "undecided" means setup has not been finished.
 * Kept for this visit only, like every other choice (docs/AGENTS.md §14.7).
 */
export type CheckInsChoice = "yes" | "no";
export type Consent = { checkIns: CheckInsChoice } | "undecided";

function isChoice(raw: unknown): raw is CheckInsChoice {
  return raw === "yes" || raw === "no";
}

const consent = createSessionValue<Consent>("studysense.consent", "undecided", (raw) =>
  typeof raw === "object" && raw !== null && isChoice((raw as Record<string, unknown>).checkIns)
    ? { checkIns: (raw as { checkIns: CheckInsChoice }).checkIns }
    : null,
);

/** A pick made in setup but not yet confirmed, so a reload mid-setup keeps it. */
const draft = createSessionValue<CheckInsChoice | "none">("studysense.setupDraft", "none", (raw) =>
  isChoice(raw) ? raw : null,
);

export const useConsentValue = consent.useValue;
/** null until the browser's value is known, so the Dashboard never flashes "Get started". */
export const useKnownConsent = consent.useKnownValue;
export const setConsent = consent.write;

export const useSetupDraft = draft.useValue;
export const clearSetupDraft = () => draft.write("none");
