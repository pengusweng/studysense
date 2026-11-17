/**
 * The four estimated daily profiles (docs/AGENTS.md §1). They come from splitting SSAQS self-reported stress and
 * anxiety at 50, an operational threshold set for the course, not a clinical boundary. A profile describes a
 * recorded day, never how a student feels right now.
 */
export type ProfileCode = "LSLA" | "LSHA" | "HSLA" | "HSHA";

export type Profile = {
  code: ProfileCode;
  name: string;
  stress: "lower" | "higher";
  anxiety: "lower" | "higher";
};

/** In plot order: higher anxiety on top, higher stress on the right. */
export const PROFILES: Profile[] = [
  { code: "LSHA", name: "Lower stress, higher anxiety", stress: "lower", anxiety: "higher" },
  { code: "HSHA", name: "Higher stress, higher anxiety", stress: "higher", anxiety: "higher" },
  { code: "LSLA", name: "Lower stress, lower anxiety", stress: "lower", anxiety: "lower" },
  { code: "HSLA", name: "Higher stress, lower anxiety", stress: "higher", anxiety: "lower" },
];

export function profileByCode(code: ProfileCode): Profile {
  return PROFILES.find((p) => p.code === code)!;
}
