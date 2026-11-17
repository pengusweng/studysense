# StudySense frontend: context for agents

Read this before changing anything under `web/`. It consolidates the project's two concept documents, the nine open design issues, and the current state of the `development` branch into one description of the frontend being built.

**Sources (as of 2026-11-17)**

| Source | What it settles |
|---|---|
| `docs/StudySense.md` | Problem framing, intended user, why the system is empathic |
| `docs/StudySense_Module2_Responses.md` | System behaviour: inference, decisions, response selection, timing, uncertainty, pipeline |
| GitHub issues #1 to #9 (`[DESIGN] 01` to `09`) | Information architecture, screens, states, copy rules, visual system |
| `web/` on `development` (commit `c47373e`) | Tech stack and code architecture |
| `etl/` on `development` | Shape and meaning of the data behind the UI |

The design issues are all open, unassigned, and marked "To do". Their priorities are proposed, not confirmed. Treat them as the intended direction, not as approved final designs. No Figma source or approved mockups exist yet.

**When sources conflict:** take the narrower, more conservative reading, build that, and flag the conflict to the user. Known conflicts are listed in section 14.

---

## 1. The product in brief

StudySense is a web-based academic support tool for university students. It replays existing wearable-derived data, shows a tentative daily stress-anxiety estimate from a machine learning model, optionally asks the student how studying is going, and then either offers light support or stays quiet. The student can accept, dismiss, or correct whatever it suggests.

The design principle behind every screen: **wearable data is evidence, not emotional truth.** Elevated physiological arousal can mean stress, focus, excitement, or recent exercise. The system therefore asks before assuming, and treats not interrupting as a valid outcome.

The brand character is called *Soft Intelligence*: thoughtful, calm, discreet, student-controlled.

**The four estimated profiles**

| Code | Meaning |
|---|---|
| LSLA | Low Stress, Low Anxiety |
| LSHA | Low Stress, High Anxiety |
| HSLA | High Stress, Low Anxiety |
| HSHA | High Stress, High Anxiety |

These come from splitting SSAQS self-reported stress and anxiety (0 to 100) at 50: below 50 is lower, 50 or above is higher. That midpoint is an operational threshold set for the course, not a clinical boundary. The profile is a **daily** estimate, not a reading of how the student feels right now.

---

## 2. Hard rules

These hold for every screen, component, and string. If a task would break one, stop and ask.

1. **No diagnosis.** Never present a profile as a medical or psychological diagnosis, a verified current emotion, a risk level, or a clinically valid threshold.
2. **No fabricated numbers.** No invented stress percentages, confidence percentages, risk scores, task totals, or decorative charts. Show a confidence value only if the model really outputs one that has been evaluated.
3. **No fake live sensing.** The MVP replays offline SSAQS records. Never show device pairing, syncing animations, or a "connected wearable" state as if it works. Do not name a live Fitbit or Garmin connection.
4. **Disclose the demo source before any estimate appears.** Offline demo data must be visibly distinct from anything the student types in during a session.
5. **Everything optional stays optional.** Check-ins can be skipped or dismissed with no warning, penalty, or blocked session. Consent options are never preselected. The core study experience works without agreeing to check-ins.
6. **Never force an action.** The UI never stops a study session, changes academic tasks, or discloses sensitive information on its own.
7. **Silence is a designed state.** "No prompt" must be an explicit, implemented outcome, not a missing screen. A quiet state adds no pop-ups, celebratory animation, mascot, or notification.
8. **Help is always reachable.** A student can ask for help regardless of which profile was estimated, and even when no estimate is available.
9. **Do not overclaim.** No claims of automatic model retraining from feedback, automatic personalisation, historical insights, secure production storage, verified dataset licensing, or newly enrolled participants.
10. **SSAQS questionnaire scores are not UI inputs.** They are training and evaluation targets for the model. Student check-in answers are a separate thing and must look separate.
11. **Responses come from predefined templates chosen by rules.** Do not add generative or LLM-written responses.

---

## 3. MVP scope

**In scope**

- Consent and setup, with a transparent SSAQS demo entry
- Dashboard with one clear primary action: start or resume studying
- Study Session workspace with ready, active, paused, and ended states
- Display of a tentative daily profile, including unavailable and uncertain states
- Optional check-in for voluntary context
- Rule-selected responses: offer help, ask for clarification, suggest recovery, or stay silent
- Feedback on a suggestion: Accept, Dismiss, Correct
- Preferences for check-in opt-in, interruption level, and explanation or privacy controls

**Out of scope**

- Real-time sensing, wearable APIs, live distress alerts
- Clinical assessment or advice
- Analytics dashboards, live biosignal charts, community features
- A physical robot, animated avatar, or voice agent
- An animated mascot, virtual pet, or 3D assets
- Push notification scheduling
- Training the model from feedback

A timer, task list, or progress tracker is **not** confirmed. If one is needed, label it a proposal and ask before building it.

---

## 4. Information architecture

Exactly **three persistent destinations**:

1. **Dashboard**
2. **Study Session**
3. **Preferences**

Suggested routes (not yet in the repo, so confirm before relying on them): `/dashboard`, `/study-session`, `/preferences`.

Everything else is a **contextual flow**, not a navigation link: consent and setup, the demo record selector, the check-in, the estimate explanation, support and quiet states, and feedback. Do not add a fourth nav item without the team approving a scope change. The Dashboard must not repeat the nav destinations as quick-access cards.

The **demo/operator record selector** (choosing which SSAQS participant-day to replay) is separate from the student-facing flow. Label it clearly as a demo control. It must not look like connecting a device.

---

## 5. The core journey

```
entry / consent
  → start study
  → SSAQS demo replay
  → tentative daily estimate
  → optional check-in
  → rule-based response, or silence
  → feedback (accept / dismiss / correct)
  → next interaction uses that feedback
```

This mirrors the pipeline in the Module 2 document: User → Perception → Affective/Contextual Interpretation → Decision → Response Selection → Expression → User Reaction → back to Perception.

Four paths must all work end to end, with a clear entry and exit at each step and no dead ends:

| Path | What happens |
|---|---|
| Happy path | Estimate shown, student checks in, a response is offered, student gives feedback |
| Skip check-in | Student skips or dismisses the check-in and keeps studying |
| No interruption | The system decides not to prompt; the session stays quiet |
| Estimate unavailable | No estimate is shown; the session still works and help is still reachable |

Back and exit must work mid-flow without losing context unnecessarily.

---

## 6. Screens and required states

### Consent and setup (issue #3)

- Explains what information is used and that student-provided context is optional
- Discloses offline demo mode and use of an existing dataset
- Neutral choices, nothing preselected, explicit labels
- States: decline, back, resume, reopen the explanation, replay record unavailable, no permission to store preferences

### Dashboard (issue #4)

- One obvious primary action: start or resume a study session
- A demo-data indicator that is visible but does not compete with that action
- Prioritises the study task and appropriate support over physiological analytics
- States: first visit with no history, loading, empty, offline data unavailable

### Study Session (issue #4)

- States: ready, active, paused, ended or returned
- Does not assume a timer exists
- Hosts the contextual flows below
- States: not started, paused or interrupted, small screens, keyboard-only use

### Optional check-in (issue #5)

- A lightweight pattern: inline panel, dialog, or contextual sheet (not yet decided)
- Neutral, non-leading questions, for example whether help is wanted or the student prefers to study uninterrupted
- Never asks the student to diagnose themselves
- Controls: respond, skip, dismiss, ask for help directly
- Visually distinct from SSAQS questionnaire data
- Every outcome (submitted, skipped, declined, no response) leads to a defined next state
- States: skip, no response, context conflicts with the estimate, help requested with no estimate, focus preference set to minimise interruptions

### Estimate and response states (issue #6)

- One component state per profile (LSLA, LSHA, HSLA, HSHA), plus unavailable, plus uncertain or incomplete input
- Explanation copy: why the estimate is tentative and what the student can correct
- Response variants: offer optional help, ask for clarification, support an explicit help request, preserve study flow
- No red alarm visuals, no faces that imply a diagnosis, no animated pressure to accept help

### Feedback (issue #7)

- **Accept**, **Dismiss**, **Correct**, shown whenever a suggestion is shown
- A correction is acknowledged, with a clear way back to studying
- Each action changes the next UI state in a documented way

### Preferences (issue #7)

- Opt-in for context prompts, interruption level, explanation and privacy controls
- Every control has a label, a description, a default, and selected and unselected states
- No feedback history or sensitive values displayed until a data policy is confirmed
- States: default, changed, declined, reset, unavailable or not persisted

---

## 7. Response behaviour the UI must support

The response is chosen by a **rule-based mechanism** from four inputs: the estimated profile, model uncertainty, academic context, and student preferences. The frontend renders the result. It does not compute profiles or pick responses on its own unless the team decides the rules live client-side.

Rules stated in the sources:

| Situation | Required UI outcome |
|---|---|
| HSHA estimate, student confirms feeling overwhelmed | Optional support: suggest breaking the task into smaller steps, or a short break |
| HSHA or other elevated estimate, student reports being comfortable and focused | Preserve flow: no recommendation, no interruption |
| Evidence is uncertain, missing, or contradictory | Clarify, defer, or abstain. Tentative wording only. Default to the least intrusive option |
| Student asks for help directly | Offer support, whatever the profile, including when there is none |
| Student dismisses or declines | Continue the session. Do not repeat the same prompt |
| Student prefers fewer interruptions | Respect it and stay silent |

The full set of actions available to the system: offer academic help, ask a clarifying question, adapt study recommendations, encourage, suggest a recovery break, adjust interaction pacing, or stay silent.

Support suggestions named in the sources: a short recovery period, a shorter next study interval, breaking a difficult task into smaller steps, switching temporarily to a less demanding activity.

**Timing.** Unsolicited prompts should appear at a natural pause, not mid-task, and never repeatedly on isolated or unreliable readings. Because the labels are daily, nothing in the UI should behave like a real-time distress detector.

**Not defined yet:** specific rules for LSLA, LSHA, and HSLA. See section 14.

---

## 8. Copy rules

- Tentative language for every estimate: "may", "suggests", "estimated". Never "you are stressed".
- Call it an estimated daily profile, not an emotion, mood, or diagnosis.
- Say what the estimate is based on (replayed demo data) and that the student can correct it.
- Check-in questions are neutral and respectful. Skipping carries no warning.
- Feedback copy may say feedback can inform later response selection. It must not say the model was retrained or that the system has learned.
- Keep previously collected SSAQS questionnaire targets and new optional check-in context clearly apart in wording.
- Messages are brief. The interface is meant to be minimally intrusive.

---

## 9. Visual system (issue #2)

**Colour tokens**

| Token | Hex |
|---|---|
| Cloud White | `#FAF8FE` |
| Pale Lavender | `#F2EDFB` |
| Iris | `#7759BA` |
| Deep Iris | `#60449D` |
| Ink | `#29243B` |
| Sage | `#A8CFC7` |

Still to be defined by design: borders, neutral text colours, semantic status colours, type scale, typefaces, spacing grid, container widths, radius and shadow tokens. Do not invent a full system for these. If you need a value, add it as a clearly named placeholder token and flag it.

**Components the system must cover:** navigation, button, input, checkbox or choice, contextual prompt, inline disclosure, status, tooltip, toast, response-feedback controls.

**Button states:** default, hover, focus-visible, disabled, loading, for both primary and secondary. Other controls need selected, unselected, and error states where relevant.

**Brand:** a wordmark, a logo mark, an app icon and favicon, a consistent icon style, and one restrained signature motif (for example an abstract orbit, ribbon, or supportive signal) used at two or three touchpoints only. None of these assets exist yet. A mascot is optional, P1, unapproved, and must be removable with no loss of function. Do not build one unless asked.

**Tone:** calm and non-clinical. Uncertainty and optional prompts use a light visual language, not alarm styling.

---

## 10. Accessibility and responsiveness

- WCAG 2.2 AA contrast for text and controls
- Visible keyboard focus, never conveyed by colour alone
- Meaning never carried by colour or a decorative icon alone; icons that carry meaning get a text label or accessible name
- Logical keyboard order, and focus returns to a sensible place after a dialog or prompt closes
- Layouts for narrow mobile and desktop, with no horizontal overflow
- Handles long labels, text zoom, and adequate touch targets
- Motion is subtle and optional, respects `prefers-reduced-motion`, and is never needed to understand or use a control
- Every data view has loading, empty, disabled, and unavailable states

---

## 11. Tech stack and code architecture

From `web/package.json` and `web/README.md` on `development`:

- **Next.js 15** (App Router), **React 19**, **TypeScript 5.6** in strict mode
- Path alias `@/*` → `web/src/*`
- No styling library, component library, state library, or test runner installed. The scaffold uses inline `style` props. Ask before adding dependencies.
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`
- Environment: `NEXT_PUBLIC_API_URL` (example value `http://localhost:8000`), copied from `.env.example` to `.env.local`

**Folder layout**

```
web/src/
  app/                      # routes only: thin pages that render a container
  components/               # global shared components
    atoms/ molecules/ organisms/
  features/<feature>/
    components/{atoms,molecules,organisms}/
    hooks/                  # state and data logic
    services/               # API calls
    containers/             # wires hooks to components; rendered by app/ pages
    types.ts
  lib/                      # shared utilities (http client, ...)
```

**Conventions to follow**

- Flow: `app/` page → container → hooks and services + organisms → molecules → atoms
- Pages in `app/` stay thin: they render one container and nothing else
- Containers and hooks are client components (`"use client"`)
- **Features must not import from each other.** Share through `components/` or `lib/`
- Atomic design naming inside both `components/` and each feature
- API calls live in a feature's `services/`, are called from its `hooks/`, and go through the shared `http` helper

---

## 12. Data behind the UI

The `etl/` pipeline loads the SSAQS dataset (Students' Stress and Anxiety Questionnaires & Sensors) into PostgreSQL on Supabase.

- 35 university students, February to July 2025
- Wearable: **Fitbit Inspire 3**. Steps, activity level, HRV, SpO2, sleep, and a daily Fitbit stress score
- Self-reports: daily stress and anxiety ratings, 0 to 100
- Main table: `clean.daily_features`, one row per participant per day, 36 columns, 3,618 rows
- ML-ready view: `clean.v_ml_ready_daily_features`, 2,291 rows with both sensor data and labels
- Full column definitions: `etl/docs/data-dictionary.md`

Things that affect the UI:

- **`fitbit_stress_score` runs opposite to what the name suggests.** Per the data dictionary, higher values mean greater physiological resilience and lower stress. It can also be `NULL` when Fitbit's calculation failed.
- Most feature columns are nullable. Every display needs a missing-value state.
- `reported_stress_*` and `reported_anxiety_*` are the ground-truth labels. They are model targets. Do not show them as if the student just entered them, and do not feed them to inference.
- The data is per day. There is no minute-level or live signal for the UI to show.

**No backend API exists in the repo.** The scaffold calls `GET /daily-features` and `POST /self-reports` against `NEXT_PUBLIC_API_URL`, but nothing serves them, and no model-serving endpoint is defined. Treat all API shapes as undecided.

---

## 13. Where the current scaffold differs from the intended design

The `development` scaffold (`feat(web): scaffold web architecture`) sets up the architecture but predates the design issues in content. Keep its structure and conventions. Do not treat its screens as the spec.

| In the scaffold | Intended | 
|---|---|
| Nav has two links: Dashboard and Self-report | Three destinations: Dashboard, Study Session, Preferences. The check-in is a contextual flow, not a nav link |
| `/self-report` page asks "How stressed do you feel today?" and "How anxious do you feel today?" on a 1 to 5 scale | An optional, neutral check-in about how studying is going and whether help is wanted. It must not resemble the SSAQS questionnaire or ask for self-diagnosis |
| `StressBadge` labels the score low, medium, or high using cut-offs at 40 and 70 | No invented stress levels. The cut-offs are not from any source, and they read the Fitbit score backwards (higher is lower stress) |
| Dashboard is three metric cards: Stress, Sleep, Steps | Dashboard leads with starting a study session, not physiological metrics |
| No Study Session or Preferences feature | Both required for the MVP |
| No consent, estimate, response, or feedback UI | All required for the MVP |
| Inline styles with greys (`#1a1a1a`, `#fafafa`, `#ddd`) and `system-ui` | The token palette in section 9 |
| `web/src/lib/http.ts` is imported but not in the repo | The root `.gitignore` has a `lib/` rule (from the Python template) that ignores `web/src/lib/`. The app will not build from a fresh clone until that is fixed |
| `DailyFeatures` type has `stressScore`, `sleepHours`, `steps` | These do not match `clean.daily_features` column names. There is no `sleepHours` column; sleep is `sleep_overall_score` and `deep_sleep_minutes` |

---

## 14. Open decisions

Do not settle these silently. Ask, or take the conservative option and say so.

1. **Chat assistant.** The Module 2 document proposes an optional text-based conversational assistant. Issue #1 lists chat screens as out of scope. Default: do not build one.
2. **Physiological summaries.** The Module 2 document says the interface can show physiological summaries and the predicted category. Issue #4 rules out stress percentages, clinical graphs, and invented analytics. Default: show only real replayed values, labelled as demo data, and keep them secondary to the study task.
3. **Which wearable to name.** The concept document discusses Garmin and Apple Watch and cites Garmin research. The dataset is Fitbit Inspire 3. Default: describe the source as offline SSAQS demo data and avoid implying any live device.
4. **Rules for LSLA, LSHA, and HSLA.** Only HSHA cases are spelled out. The rule-to-interface mapping is meant to follow "Group 3 Scaffold #3" and be agreed with the Affective Research lead.
5. **Where response rules run.** Client, backend, or both is undecided, as is the whole API contract.
6. **How uncertainty reaches the UI.** No model output format is defined. Do not display a number for it.
7. **Persistence.** Whether consent, preferences, check-ins, and feedback are stored, and where, is undecided. Design for a "not persisted" state.
8. **Check-in pattern.** Inline panel, dialog, or sheet.
9. **Timer, task list, progress.** Unconfirmed.
10. **Remaining design tokens and brand assets.** See section 9.
11. **Sources this file could not draw on.** Two Google Docs referenced by every design issue (the "Group 3 StudySense scaffold" and the "StudySense execution plan") and a 28-slide kickoff deck were not available when this file was written. If they are provided, they may resolve several items above.

---

## 15. Before you finish a frontend task

- Does any string state or imply how the student feels as a fact?
- Does any number on screen come from somewhere other than real data?
- Could a first-time viewer think a device is connected live?
- Can the student skip, dismiss, or decline at this point with no penalty?
- Is there a defined quiet state, an unavailable state, and a loading state?
- Is it usable by keyboard, with visible focus, at mobile width, with motion reduced?
- Did navigation stay at three destinations?
- Did you keep features from importing each other and keep `app/` pages thin?
