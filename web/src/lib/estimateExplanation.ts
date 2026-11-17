/**
 * Why the estimate is tentative and what the student can do about it (docs/AGENTS.md §6, §8). Shared by the
 * session's estimate note and Preferences, so both say the same thing.
 */
export const ESTIMATE_SOURCE =
  "It comes from one recorded day of another student’s Fitbit data in the SSAQS dataset, replayed for the demo. Nothing is measured from you.";

export const ESTIMATE_MODEL =
  "A model sorts days into four profiles by splitting stress and anxiety at the midpoint. That split is a course threshold, not a clinical one, and the model’s guesses are rough.";

export const ESTIMATE_MISSING =
  "A model sorts days into four profiles, but when more than half of a day’s readings are missing it doesn’t guess.";

export const ESTIMATE_LEAD = "So treat it as a lead, not a verdict. If it doesn’t fit, you can correct it or ignore it.";
