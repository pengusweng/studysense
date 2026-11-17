---
version: 1
slug: "src-app-app-study-session-page-tsx"
primary_target: "src/app/(app)/study-session/page.tsx"
related_targets: ["src/features/study-session"]
---

# Study Session surface brief

Scope: `/study-session` (route group `(app)`), focus mode only: ready, active, paused, ended. Mode: **Operate**. The estimate, check-in and feedback come in later rounds (issues #5–#7).

- **Audience and job:** a student who has just pressed Start. They should know at a glance, from across the room, that they are in a session, then be left alone to study. They can pause, end, or ask for help at any moment.
- **Constraints:**
  - AGENTS.md hard rules apply.
  - No timer, countdown or elapsed time (not confirmed scope; the user chose none).
  - No numbers or progress.
  - No celebration on end.
  - Motion must never read as live sensing: nothing pulses like a heartbeat or syncs.
  - The demo source is disclosed in the session, because the Dashboard no longer carries the demo strip.
- **User answers (2026-11-17):**
  - Remove the Dashboard's demo strip and move the disclosure into the session.
  - No timer.
  - Focus mode + states.
  - Locked structure: Calm field.
- **User answers (2026-11-17, polish):**
  - Active and paused go full screen: the wordmark and tabs step away (`html[data-session="focus"]`) and the sheet fills the window edge to edge. They return on End.
  - The full-width demo strip is gone. The source, "What does this mean?" and "Change demo record" (still tagged "demo control") sit as a footnote under the main action in Ready and Ended.
  - The full-screen view carries no demo source line; it was disclosed before Start.
  - The Studying view felt plain. Added motion that stays calm: on entry a fresh page (the margin line inks down, then an Iris pen stroke underlines "Studying."), and ambient lamplight (two faint Iris pools wandering on 53s and 71s paths, never a beat). Pause removes the underline and freezes the light; Resume redraws it.

## Direction contract

THESIS: Focus is the whole page going quiet. The sheet's own ruling drifts like a slow tide, and one word says where you are. It refuses the focus-app default of a countdown ring, a progress arc and a celebration.

OWN-WORLD: The StudySense notebook from DESIGN.md:
- A Cloud White sheet on the Desk lavender ground, under the index tabs.
- Graph ruling becomes two layers of horizontal rules, the fine Rule lines plus a sparse 1.5px Iris-tinted line, drifting at different speeds.
- Schibsted Grotesk display, the Nanum Pen Script hand note in Iris, and Red Hat Mono only for the demo source line.
- Deep Iris for actions. No cards and no icons.

STORY:
1. Ready: the sheet is still. "Start studying" is the one action; under it, a footnote gives the demo source in mono, with "What does this mean?" and "Change demo record".
2. Active: the rules begin to drift. "Studying." rises in at display size, a soft Iris dot breathes beside "Session in progress", and the hand note says "nothing needs you right now". The tab title becomes "Studying · StudySense".
3. Paused: the drift halts in place. The word becomes "Paused." and the note says "your place is kept".
4. Ended: the lines settle and fade to stillness, then "Session ended." with "Start another" and "Back to the Dashboard". No celebration.

FIRST VIEWPORT (active):
- Full screen: no wordmark or tabs, and the sheet fills the window edge to edge.
- Top right: "Need help? Ask for support". Nothing else sits at the edges.
- In the centre: the dot with "Session in progress", "Studying." at about 84px / weight 800, and the hand note.
- Low and centred: "Pause" (outlined) and "End session" (text).
- Signature move: the tide. Starting a session sets the ruling in motion; pausing freezes it mid-drift; ending lets it settle.

FORM: Calm field, position 5 of 7 on the ordered list. seed:1ab117708a1f38cd

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- The estimate note (issue #6) is built as states only (`EstimateNote`, reviewed at `/review/estimate`) and is not yet placed in the session. Predictions need a source: the trained model is not in the repo, and the evaluated policy currently returns every day as uncertain or missing evidence.
- The estimate, check-in, response and feedback flows are not built (issues #5–#7).
- The consent flow (issue #3) is not built.
- Whether a timer ever ships is the team's decision; none is built.
