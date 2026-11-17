---
version: 1
slug: "src-app-app-preferences-page-tsx"
primary_target: "src/app/(app)/preferences/page.tsx"
related_targets: ["src/features/preferences"]
---

# Preferences surface brief

Scope: `/preferences` (route group `(app)`), the third nav destination. Mode: **Operate**. Issue #7.

- **Audience and job:** a student who wants to change how much StudySense asks, whether the estimate shows, or clear what the visit kept. They should find each control in seconds and know it took effect.
- **Constraints:** AGENTS.md hard rules. Every control has a label, a description, a default, and selected and unselected states. No feedback history or stored values are displayed. States: default, changed, declined, reset, not persisted. Nothing persists beyond the visit (§14.7).
- **User answers (2026-11-17):**
  - Interruption level means *when* the check-in may ask: at the first pause (default) or only after a session ends. It applies only when check-ins are on.
  - The explanation control shows or hides the estimate on the ready screen, with "How the estimate works" in place.
  - Privacy is one "Clear what this visit kept" action with an inline confirm; it doubles as reset.
  - Changes apply instantly, with "Saved for this visit." under the section that changed.

## Direction contract

THESIS: a settings page written as one notebook page: three ruled sections, plain questions, the same circled answers the student already used in setup.

OWN-WORLD: the StudySense notebook (DESIGN.md): graph-ruled sheet, print headings, Pencil hints, Iris circles for the student's picks, mono log for "What this visit keeps".

STORY:
1. Arrive: "Preferences", then "Changes apply straight away and last for this visit."
2. Check-ins: the setup question (shared value), then "When may it ask?", disabled in words when check-ins are off.
3. Estimate: show or hide it; read how it works in place.
4. Privacy: what is kept, as kinds not values; clear with a confirm that names what goes and what stays (dark mode).

## Unresolved
- Persistence beyond the visit is undecided; when it is decided, the lede and the privacy prose change.
