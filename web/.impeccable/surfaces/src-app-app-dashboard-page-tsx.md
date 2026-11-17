---
version: 1
slug: "src-app-app-dashboard-page-tsx"
primary_target: "src/app/(app)/dashboard/page.tsx"
related_targets: ["src/features/dashboard"]
---

# Dashboard surface brief

Scope: `/dashboard` (route group `(app)`) and its contextual flows (demo-mode explanation, demo record selector, help panel). Mode: **Operate**. Content plan: `docs/dashboard-plan.md`.

- **Audience and job:** a university student opening the app to study. The job is to start or resume a study session. They also need to know, at a glance and quietly, that the data is a replayed SSAQS demo record.
- **Constraints:** AGENTS.md hard rules. There is no estimate on this page, the nav has exactly three destinations, and no metrics. Help must be reachable without a session.
- **User answers (2026-11-17):**
  - Scope: the Dashboard plus its own flows. Study Session and Preferences get honest placeholders.
  - World: same materials, app layout.
  - It must not feel like a SaaS template, too empty, or too busy.

## Direction contract

THESIS: Name the source before anything else, then give the sheet to one action. It refuses the category default of a card grid of metrics, a sidebar and a greeting hero.

OWN-WORLD: The notebook from DESIGN.md, laid out as a single sheet:
- Desk lavender ground and index-tab nav standing on a graph-ruled Cloud White sheet.
- A Red Hat Mono provenance strip under an Ink rule.
- Schibsted Grotesk print, with Deep Iris only on the one filled action and links.
- No cards and no icons.

STORY: The student sees which recorded day will be replayed and that it is not live, starts a session in one click, and knows help is one click away whatever happens. A first-time visitor also reads how a session goes in four ruled lines.

FIRST VIEWPORT:
- Tabs: Dashboard (current), Study Session and Preferences on the sheet's top edge.
- The sheet's first line is a full-width mono strip: "Demo mode · SSAQS participant 01 · Mon 24 Feb 2025 · replayed, not live", plus "What does this mean?" and "Change demo record", tagged as a demo control.
- Centred below, at display-sm: "Ready when you are." Under it, the only filled button, "Start a study session" (or "Resume session" when paused), at 56px tall. Then "Need help now? Ask for support."
- Lower sheet: "How a session goes", four numbered ruled columns, dismissible to a one-line reopen link.
- Signature move: the strip unfolds in place. "What does this mean?" opens the explanation as an extension of the strip itself, ruled and mono-headed, never a modal.

FORM: Provenance strip + centred start, position 5 of 7 on the ordered list. seed:c3263bb23126a856

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- The consent flow (issue #3) is not built. "Get started" gating waits for it.
- Response-rule location: the help panel offers templated options only, with no estimate.
- The demo record list is built from the raw SSAQS days that have a calculated Fitbit stress score. It should come from the API once one exists.
