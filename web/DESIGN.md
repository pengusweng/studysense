---
name: StudySense
description: A study companion that treats wearable data as evidence, asks before it assumes, and is allowed to stay quiet.
colors:
  cloud-white: "#faf8fe"
  pale-lavender: "#f2edfb"
  iris: "#7759ba"
  deep-iris: "#60449d"
  ink: "#29243b"
  sage: "#a8cfc7"
  rule: "#e3daf3"
  rule-strong: "#c9bce4"
  pencil: "#625c75"
  desk: "#ece5f8"
typography:
  display:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 1.4rem + 3vw, 4.125rem)"
    fontWeight: 800
    lineHeight: 0.97
    letterSpacing: "-0.035em"
  display-sm:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.3rem + 2.2vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.03em"
  readings:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1.6rem + 1.2vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1
  headline:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1vw, 2rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Schibsted Grotesk, Segoe UI, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.4
  log:
    fontFamily: "Red Hat Mono, ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    fontFeature: "tnum"
  hand:
    fontFamily: "Nanum Pen Script, Segoe Print, cursive"
    fontSize: "1.7rem"
    fontWeight: 400
    lineHeight: 1
rounded:
  page: "3px"
  control: "6px"
  tab: "8px"
  pill: "999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "1rem"
  "4": "1.5rem"
  "5": "2.5rem"
  "6": "4rem"
  "7": "6rem"
components:
  button-primary:
    backgroundColor: "{colors.deep-iris}"
    textColor: "{colors.cloud-white}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.35rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cloud-white}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.deep-iris}"
    rounded: "{rounded.control}"
    padding: "0.7rem 1.35rem"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.pale-lavender}"
  index-tab:
    backgroundColor: "{colors.pale-lavender}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tab}"
    padding: "0.5rem 1rem 0.45rem"
    height: "2.75rem"
  index-tab-current:
    backgroundColor: "{colors.cloud-white}"
    textColor: "{colors.ink}"
  notebook-page:
    backgroundColor: "{colors.cloud-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.page}"
    padding: "clamp(1.25rem, 3.6vw, 3.75rem)"
---

# Design System: StudySense

<!-- Brand colours come from design issue #2 (docs/AGENTS.md §9). Everything else (rule, rule-strong, pencil, desk, spacing, radii, type scale) is a --proposal-* token in src/app/globals.css, pending design-team approval. -->

## Overview

**Creative North Star: "The Field Notebook"**

StudySense is a bound notebook on a lavender desk. The left page is what the sensor observed. It is written in a mono log voice, with sensor values highlighted in sage. The right page is what the student concludes, in printed type, and their own hand-written marks are in iris. The whole system is built around this split: data is a lead and the student writes the conclusion. Every surface is a spread of graph-ruled pages with folios and an inked binding line. These are not floating cards on a gradient.

Density is calm and generous: one idea per spread, with lots of ruled space. The grid ruling is the world, a measuring surface, so it is never used as decoration elsewhere. The voice is tentative ("may", "estimated", "could mean") and the visuals match. Struck-through guesses, circled answers and margin notes show reasoning in progress rather than verdicts.

**Key Characteristics:**
- Two-page spreads on graph-ruled Cloud White paper, set on a Desk lavender ground.
- Three type voices, each with one job: print (Schibsted Grotesk), sensor log (Red Hat Mono), student's hand (Nanum Pen Script).
- Colour carries meaning: sage means sensor evidence, iris means the student, deep iris means action.
- Index-divider tabs replace a conventional nav bar.
- Motion is pen-and-paper: pages swing open, rows are written in, strikes and circles are drawn.

## Colors

The palette is restrained lavender paper with one accent per meaning. No colour is decorative.

### Primary
- **Deep Iris**: every action. This covers filled buttons, links, the demo tab, focus rings and the native accent colour. If something is Deep Iris, you can click it.
- **Iris**: the student's hand. It is used for hand-written notes, the circle around a chosen answer, the wavy strike over ruled-out guesses, the "Your reading" underline and the checked radio dot.

### Secondary
- **Sage**: sensor evidence only. It is a highlighter over a logged value (for example, the Fitbit stress score) and the text-selection colour.

### Neutral
- **Ink**: all printed text, the binding line (30% opacity), dashed plot split lines and the current tab's top edge.
- **Pencil**: tentative and secondary text, such as hints, labels, folios, muted struck guesses and the footer. It has a 5.5:1 contrast ratio on Cloud White.
- **Cloud White**: the paper.
- **Pale Lavender**: resting index tabs, and the hover state on secondary buttons.
- **Rule**: the 24px graph ruling and hairlines.
- **Rule Strong**: table and margin rules, tab borders and the scrollbar thumb.
- **Desk**: the ground behind the notebook, and the header background.

### Dark theme ("the notebook after dark")
The same notebook under a desk lamp: a violet-black desk, slate paper and chalk-pale ink. Every colour keeps its job; only its value changes. The tokens are redefined in `globals.css` under `:root[data-theme="dark"]`, and under `prefers-color-scheme: dark` when the visitor has made no choice.

| Token | Light | Dark | Dark contrast on paper |
|---|---|---|---|
| Desk | #ece5f8 | #131019 | — |
| Cloud White (paper) | #faf8fe | #1d1928 | — |
| Pale Lavender | #f2edfb | #2a2439 | — |
| Ink | #29243b | #ece7f7 | 14.2:1 |
| Pencil | #625c75 | #a7a0bd | 6.9:1 |
| Iris | #7759ba | #b095ec | 6.8:1 |
| Deep Iris | #60449d | #c4b0f7 | 8.9:1 |
| Sage | #a8cfc7 | #355e55 | Ink on it 6.0:1 |
| Rule | #e3daf3 | #2b2539 | — |
| Rule Strong | #c9bce4 | #4a4063 | — |

- **Actions turn pale.** In dark, Deep Iris is the lightest hue on the page, so a filled button is pale violet with paper-dark text (`--on-action`). It still leads, and it is still the only thing in Deep Iris.
- **Depth by surface, not shadow.** Shadows barely read on dark paper. Paper that rests on the sheet (the support slip) uses `--paper-raised`, one step lighter.
- **No module hard-codes a light colour.** Shadows use `rgb(var(--shadow-rgb) / a)`, Iris washes use `rgb(var(--iris-rgb) / a)`, and drawn SVG data URIs come from theme tokens (`--select-chevron`, `--iris-strike`).

### Named Rules
**The Sage Is Evidence Rule.** Sage marks only something a sensor recorded. Never use it for success states, buttons or decoration.

**The Iris Is The Student Rule.** Iris marks only what the student says or decides: a hand note, a circle, a strike. Actions take Deep Iris, never Iris.

## Typography

**Display Font:** Schibsted Grotesk (with Segoe UI, system-ui)
**Body Font:** Schibsted Grotesk
**Label/Mono Font:** Red Hat Mono (sensor log only)
**Hand Font:** Nanum Pen Script (the student's hand only)

**Character:** A dense, newspaper-weight grotesk for anything printed, with a quiet mono for the instrument's voice and a felt-tip hand for the person's. The contrast between the three voices is the whole story.

### Hierarchy
- **Display** (800, fluid 38–66px, 0.97 line height, −0.035em): the hero thesis only, at most 13ch wide.
- **Display small** (800, fluid 32–52px, line height 1, −0.03em): the closing call to action only, at most 14ch. The page opens and closes on a display line; nothing in between uses one.
- **Readings** (600, fluid 32–44px, line height 1): the hero's struck-out list of possible meanings.
- **Headline** (800, fluid 24–32px, 1.08): spread titles, at most 22ch.
- **Title** (700, 20px, 1.2): sub-sections, the log title and the closing heading.
- **Body** (400, 17px, 1.55): prose up to 58ch, lede at 20px and 44ch.
- **Label** (400, 14px): hints, folios, "Your reading", table headers. Uses the Pencil colour.
- **Log** (Red Hat Mono, 14px, tabular numbers): the sensor log, provenance lines, data values, plot axes and profile codes.
- **Hand** (Nanum Pen Script, rotated −2 to −3°): about 27px (1.7rem) for margin notes and written answers, and about 21px (1.3rem) for the header's subject line.

### Named Rules
**The Say It Once Rule.** Each claim the product makes has one home on the page:
- "Replayed, not live" goes in the hero provenance line and the Data intro.
- "Tentative" goes in the plot caption.
- "Optional" is shown by the check-in itself.
- Silence gets its own spread.
- The refusals go in the limits list.
Don't restate a claim in a second section.

### Named Rules
**The Three Voices Rule.** Mono is the sensor and hand is the student. Everything else is print. If a line is neither recorded by a device nor written by the student, it is set in print.

## Layout

- **Spreads:** each section is a two-column spread with equal pages, centred, at most 1280px wide. Page padding is fluid from 20px to 60px. The ruling is a 24px graph grid offset by 1px so lines meet the page edge cleanly.
- **Page details:**
  - Each page casts a faint inner shadow toward the binding: 28px on the left page, 22px on the right.
  - Folios (page numbers) sit in the bottom corners.
  - Spreads are separated by 4rem of desk.
  - The hero spread meets the header flush, with no top rounding, so the index tabs stand on its top edge.
- **Spacing scale:** 4 / 8 / 16 / 24 / 40 / 64 / 96px.
- **At 860px and below:** spreads collapse to one column. Pages stack with a top inner shadow in place of the binding. The hero shows the student's page first, and the sensor log follows.
- **At 920px and below:** the header becomes static, with the wordmark and demo button on one row and the tabs scrolling sideways on a second row.
- **At 1100px and below:** the header's hand-written subject line hides.
- **Overflow:** there is no horizontal overflow at 390px.

## Elevation & Depth

Depth is physical, not interface chrome. The notebook lifts off the desk and nothing else floats. Inside a page, depth comes only from the binding's inner shadows.

### Shadow Vocabulary
- **Notebook on desk** (`0 1px 2px rgb(41 36 59 / 0.08), 0 28px 56px -28px rgb(41 36 59 / 0.32)`): every spread.
- **Binding fall-off** (`linear-gradient(to left, rgb(41 36 59 / 0.07), transparent 28px)`, mirrored on the right page at 0.06 and 22px): the page curving into the gutter.
- **Header resting edge** (`0 1px 0 rgb(41 36 59 / 0.18), 0 10px 18px -16px rgb(41 36 59 / 0.35)`): this appears only once the page scrolls.

### Named Rules
**The Only The Notebook Lifts Rule.** Buttons, tabs, tables and plots stay flat on the page. A shadow means paper resting on the desk.

## Shapes

Focus outlines round slightly (2px). Paper corners are nearly square (3px). Controls are gently rounded (6px). Index tabs round only at the top (8px 8px 0 0) and have no bottom border, so they read as part of the page below. Radios are true circles, and the theme switch is the one pill (a fully rounded track, 999px). Rules are hairlines (1px) for ruling and 1.5–2px for emphasis: the provenance underline, the reading line and the plot split.

## Components

### Buttons
- **Shape:** gently rounded (6px), 44px minimum height, 1.5px border.
- **Primary:** filled Deep Iris with Cloud White text, weight 600.
- **Hover / Focus:** on hover the primary button fills with Ink. Pressing nudges it down 1px. Focus shows a 2px Deep Iris outline offset by 3px.
- **Secondary:** transparent with Deep Iris text and border. Pale Lavender on hover.
- **Disabled:** Pale Lavender fill with Pencil text and a Rule Strong border.

### Navigation (index tabs)
- **Layout:** one line along the notebook's top edge. From left to right: the wordmark on the desk with a hand-written subject line, then the four section tabs (How it decides, Silence, The data, What it won't do), then "Open the demo" as the last tab.
- **Resting:** Pale Lavender with a Rule Strong border and weight 500, sitting 3px low.
- **Hover:** turns to paper and rises.
- **Current section** (`aria-current="location"`): Cloud White, a 3px Ink top edge and weight 700, pulled fully up.
- **Demo tab:** same tab geometry, filled Deep Iris.
- **Below 920px:** the tabs form a sideways-scrolling row, and the demo becomes a normal rounded button.

### Estimate note (issue #6)
- **Voice:** the model's lead, never a reading of the student. It is set in print and Pencil only: no Iris (the student's hand), no Sage (recorded values), no numbers.
- **Form:** a 44px quadrant mark that echoes the landing page's profile plot (anxiety up, stress right, split at 50), then the sentence as the heading ("The replayed day suggests …"), a mono source line, a Pencil hedge, and "Why is this tentative?" opening an explanation in place.
- **States:** confident (filled cell), uncertain (dashed cell, "may suggest", "won't act on this estimate"), missing evidence (empty grid, "won't guess"), unavailable (no mark; reason `record` when the demo record can't be replayed, `none` when there is no prediction for it), loading. The states are mapped from `ml/outputs/prediction_contract.json` by `toEstimateView`. Review them at `/review/estimate`.
- **Placement:** on the Study Session's ready screen, between the invitation and Start, as a left-set note centred as a block. Never on the full-screen "Studying." view. Predictions come from `features/study-session/services/estimateService.ts`, a stub that returns none until the trained model is available.

### Check-in panel (issue #5)
- **When:** once per session, on the first Pause, only if the student chose "Yes, now and then" in setup. It is never shown while studying.
- **Form:** unfolds in place under the hand note, ruled off above, on the same paper. It is not a dialog or a slip. It reuses `AnswerList` with "Focused. Leave me be." and "Swamped. A hand would help.", circled in Iris because the answer is the student's mark.
- **Actions, by role:** the question is a step under the word (text-lg, print). A secondary "Answer" button sits with its one alternative, "Skip this question"; the disabled reason ("Pick an answer, or skip it.") keeps its line once answered, so picking never shifts the page. "Rather have support now? Ask for help" sits below in Pencil, apart from the answers. "Not now" sits small in the top corner, level with the question, but comes last in reading order. Escape counts as Not now.
- **Leaving:** focused, skipped, dismissed and post-support close fold the panel shut (grid rows 1fr → 0fr, 420ms, in-out) so "Paused." eases back to centre instead of jumping. The outcome is recorded before the fold, and focus moves to Resume at once.
- **Outcomes:** Focused shows one Pencil line ("Noted. StudySense will stay quiet for the rest of this session."). Swamped leads to the response note below. Skip and Not now close silently. Resuming or ending without touching it records no response. Help before answering returns to the question. Stored in `lib/checkIn.ts` for this visit, apart from SSAQS data.

### Response note and feedback (issue #7)
- **Rules:** `chooseResponse` in `features/study-session/services/responseRules.ts`, a pure client-side function tested by `npm test`. An estimate alone never prompts. Focused, skip, dismiss and no response stay silent. Swamped offers one suggestion whatever the profile; only a confident HSHA estimate adds "and the replayed day may point the same way". LSLA, LSHA and HSLA take the generic path until AGENTS.md §14.4 is settled.
- **Form:** on the same ruled paper as the check-in it answers. A Pencil lead line says why ("You said a hand would help."), the suggestion is an h2 at text-lg in print, then its template response from `lib/supportOptions.ts`, the same text the support list uses.
- **Feedback:** a secondary "Accept", then "Dismiss" and "That's not it" (Correct) as text actions, then "Something else? See all options" in Pencil. Escape dismisses.

| Action | Next state |
|---|---|
| Accept | "Noted. More support is in the corner whenever you want it." The note folds; focus moves to Resume |
| Dismiss / Escape | Folds silently; that suggestion is skipped next time this visit |
| That's not it | "What fits better?" unfolds in place of the feedback row: "I'm fine, just busy." (silence, with a thanks line), "It's more than this." (a lighter suggestion, with "Thanks, that's noted. This may suit better."), "Something else is going on." (the full support list). Only one correction per suggestion, so it can't loop |
| See all options | The full support list in place |

- **Next time:** feedback is kept for the visit in `lib/feedback.ts`. A dismissed suggestion is skipped and an accepted one is offered first. Copy says only that StudySense "uses this to choose what it offers next"; it never says it learned.

### Preferences (issue #7)
- **Form:** one column on the sheet (max 46rem): "Preferences", a Pencil lede, then three sections ruled off above with print headings at text-lg. Every control reuses `AnswerList`, so picks are circled in Iris as in setup. Each hint ends with its default.
- **Check-ins:** the setup question itself (one shared value in `lib/consent.ts`), then "When may it ask?" ("At my first pause" by default, or "Only after I end a session", which moves the check-in to the ended screen as "How did studying go?"). When check-ins are off or not chosen, the second question is disabled: set back in Pencil, with the reason in its hint.
- **Estimate:** "Show it" / "Hide it". Hidden, the ready screen has no estimate note and the rules treat the estimate as unavailable. "How the estimate works" opens the shared paragraphs (`lib/estimateExplanation.ts`) in place.
- **Privacy:** what the visit keeps, as a `LogTable` of kinds, never values. "Clear what this visit kept" unfolds an inline confirm naming what goes and that dark mode stays; Clear resets every store (`lib/visit.ts`) and a focused status line says setup will be offered again.
- **Changed:** "Saved for this visit." fades in under the section that changed (`role="status"`). When storage is blocked it says "Lasts for this page only.", and so does the lede.

### Setup spread (consent, issue #3)
- **Form:** one notebook spread. The left page is the instrument's voice: "What StudySense uses" and a mono log (source, record, device, "replayed, not live"), then two printed lines. The right page is the student's: "One choice", a neutral answer list with nothing preselected, and the chosen answer circled in Iris.
- **Actions:** the primary action is disabled until a pick, with the reason in words beside it ("Pick one to continue"). "Back" saves nothing. "No, keep quiet" is a full answer, with no warning.
- **Shared parts:** Spread, LogTable, AnswerList, Hand, Highlight, Strike and HelpCorner live in `src/components`, shared by the landing page, the session and setup.

### Theme switch
- **Place:** on the desk, just right of the wordmark, sharing its line, in both the landing header and the app header. It is not a tab.
- **Form:** a small Deep Iris switch (a 1.5px pill track and a round knob) with the label "Dark mode". Below 480px only the switch shows; its accessible name stays "Dark mode" (`role="switch"`).
- **Behaviour:** it follows the system setting until the student flips it, then remembers the choice on this device. A head script applies a stored choice before first paint, so the other theme never flashes. Where supported, the swap cross-fades the whole page in 420ms; under reduced motion it is instant.

### Notebook spread
The signature container. It takes a left page and a right page, can put the right page first, and supports an intro variant and a folio number. All landing content lives inside spreads, never inside cards.

### Sensor log
A mono table of recorded values with dotted leaders and tabular numbers. A value may carry a sage highlight and a hand-written margin note in iris, such as "higher is calmer!".

### Check-in (answer list)
A single-column list of answers, one per ruled line, with a 40px minimum row height.
- **Radios:** drawn circles with an Ink 1.5px border. A checked radio gets an Iris dot.
- **Chosen answer:** circled in Iris ink, written in from left to right. Inline padding keeps the circle clear of the text.
- **Hint:** sits under the legend and is linked with `aria-describedby`.
- **Focus:** a 2px Deep Iris outline around the whole row.

### Strike (ruled-out guess)
A wavy Iris line drawn across text. It wraps across lines, can be muted to Pencil, and adds a screen-reader suffix " (ruled out)".

### Profile plot
It sits on the right page of "How it decides", opposite the 5 loop steps. Its body-size caption is the page's only statement that the estimate is tentative.
A stress × anxiety plane split at 50 by dashed Ink lines, with four quadrants labelled with mono codes. It shows geometry only, never data points.

### Motion
- **Gating:** an inline head script sets `html[data-motion="on"]` before paint, only when the visitor has no reduced-motion preference. Hidden pre-reveal states exist only under that flag.
- **Page load:** the notebook settles, the left page swings open from the spine, log rows are written in, the margin note is inked, and the tabs rise out of the notebook edge.
- **Scroll:** an IntersectionObserver reveals each spread (threshold 0.12). Each spread then has its own interior motion: steps settle, data rows write in, plot lines rule in before the quadrants, and strikes draw one by one. The Silence spread stays still on purpose.
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` throughout.
- **Reduced motion:** every duration and delay is zeroed, and everything renders in its final state.

## Do's and Don'ts

### Do:
- **Do** put every new section on a notebook spread, with a folio.
- **Do** set sensor-recorded values in Red Hat Mono, and highlight them in Sage only when they are the evidence in question.
- **Do** use Nanum Pen Script in Iris for anything the student writes, and keep it short.
- **Do** use Deep Iris for every clickable action, and nothing else.
- **Do** gate any hidden-before-reveal state behind `html[data-motion="on"]`, so content is never invisible without motion.

### Don't:
- **Don't** use Sage for success, confirmation or decoration.
- **Don't** set prose, headings, labels or UI copy in mono.
- **Don't** put content in floating cards or add shadows to anything but the notebook.
- **Don't** reuse the graph-grid ruling outside the notebook page.
- **Don't** draw charts with invented data points. Plots show geometry or real SSAQS values only.
- **Don't** show pairing, syncing or "connected" visuals. The data is a replay.
