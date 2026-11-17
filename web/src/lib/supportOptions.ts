/**
 * Predefined support options and their template responses (docs/AGENTS.md §2 rules 8 and 11, §7). Shared by the
 * support list and the session's rule-picked suggestion, so the two never drift apart. Nothing here is generated.
 */
export type SupportId = "steps" | "break" | "shorter" | "lighter";

export const SUPPORT_OPTIONS: { id: SupportId; label: string; response: string }[] = [
  {
    id: "steps",
    label: "Break a task into smaller steps",
    response: "Pick the one task in front of you and write down only its first step. Start there; the rest can wait.",
  },
  {
    id: "break",
    label: "Take a short break",
    response: "Step away from the screen for a little while, then come back to the same place. Your work will be here.",
  },
  {
    id: "shorter",
    label: "Make the next study block shorter",
    response: "Plan a shorter block than usual for the next round. You can lengthen it again once it feels easier.",
  },
  {
    id: "lighter",
    label: "Switch to something lighter for a while",
    response: "Move to a less demanding task, like tidying notes or reviewing something familiar, then return when you're ready.",
  },
];

export function supportOption(id: SupportId) {
  return SUPPORT_OPTIONS.find((o) => o.id === id)!;
}
