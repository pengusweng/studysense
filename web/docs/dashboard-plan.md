# Dashboard: content plan

Sources: GitHub issues #1 (journey/IA), #3 (consent and demo entry), #4 (Dashboard and Study Session), #6 (estimates), and `web/docs/AGENTS.md` §2–§8, §13–§15. The issues are open and unconfirmed, so this is the intended direction, not an approved design.

## Purpose
The Dashboard is the calm home screen. It has **one job: get the student into a study session**, starting or resuming one. Everything else on it is secondary and supports that action. It is not an analytics view (issue #4).

## What is on the page, in priority order

| # | Element | What it shows | Why it is here |
|---|---|---|---|
| 1 | App nav (AppShell) | Exactly three destinations: **Dashboard · Study Session · Preferences**. "Self-report" is removed. | Issue #1, AGENTS §4 |
| 2 | Heading | A short, neutral line, e.g. "Ready when you are." No name, because there are no accounts. No mood or estimate wording. | Issue #4, calm home |
| 3 | **Primary action** | **"Start a study session"**, or **"Resume session"** when one is paused. It is the only filled button on the screen and goes to `/study-session`. | Issue #4 AC 1 |
| 4 | Session status line | One line under the button, shown only when relevant. For example: "Session paused, pick up where you left off", or "Last session ended. Start another when you like." No durations, counts or streaks. | Issue #4 states; no invented totals |
| 5 | Ask for help | A quiet text action: **"Need help now? Ask for support."** It opens the support flow directly and works with no session and no estimate. | AGENTS §2 rule 8 (user decision) |
| 6 | Demo-data indicator | A small, visible band, e.g. **"Demo mode · replaying SSAQS participant 01, Mon 24 Feb 2025"**, with "What does this mean?" opening the disclosure. Styled as status, not as an action, and never as a device connection. | Issue #3/#4; AGENTS §2 rules 3–4 |
| 7 | Demo record control | **"Change demo record"**, labelled as a **demo/operator control**. It opens the record selector (participant + day). It sits apart from the student actions, e.g. inside the demo band or behind it. | Issue #1, AGENTS §4 |
| 8 | How it works (first visit only) | A short inline disclosure: StudySense replays a recorded day, may suggest a tentative daily estimate inside the session, may ask an optional question, and may stay quiet. It can be dismissed, and reopened from the demo band. | Issue #3 "reopen explanation"; issue #4 first-use |

## What is deliberately NOT on the page
- **No estimate or profile** (LSLA/LSHA/HSLA/HSHA). It appears in the Study Session after the student starts (user decision; issue #1 journey order).
- **No sensor values, charts, metric cards or stress badge.** The scaffold's `MetricsOverview`, `MetricCard` and `StressBadge` are removed. Their 40/70 cut-offs were invented and read the Fitbit score backwards (AGENTS §13).
- **No quick-access cards** to Study Session or Preferences, because they would duplicate the nav (issue #4 AC 2).
- **No timer, task list, progress or streaks.** These are unconfirmed scope (AGENTS §3). Any later proposal must be labelled as one.
- **No device pairing, "connected" status or syncing animation** (rule 3).
- **No mascot, celebration or notification badge** (rule 7, issue #9 unapproved).
- **No SSAQS questionnaire scores** shown as if the student entered them (rule 10).
- **No check-in on the Dashboard.** The check-in is a contextual flow inside the session (issue #5).

## States

| State | What changes |
|---|---|
| First visit, consent not given | The primary action becomes **"Get started"** and opens the consent and setup flow (issue #3). The demo band and "How it works" are visible. Help is still reachable. |
| Consent declined (optional check-ins) | Same as Ready. The core study experience still works (issue #3 AC 1). No warning. |
| Ready, no session | "Start a study session". No status line. |
| Session paused or interrupted | "Resume session" + the status line. A secondary "Start fresh" text action is included only if the team wants it. |
| Session ended / returned | "Start a study session" + "Last session ended…" line. No summary metrics. |
| Loading demo record | The demo band shows "Loading demo record…". The primary action stays enabled, because the session can start and the estimate arrives later. |
| Demo record unavailable | The band reads: "Demo record unavailable. You can still study; no estimate will be shown." Start is still enabled (journey path 4, "estimate unavailable"). "Change demo record" stays available. |
| Preferences not persisted | A quiet note in the band or under the actions: "Your choices last for this visit only." (AGENTS §14 item 7) |
| Small screens | Single column. The demo strip stays first (one fact per line), then the full-width primary action. No horizontal overflow. *(Built: the locked direction names the source before anything else.)* |
| Keyboard | Tab order follows the visual order: nav → demo strip links → primary action → help → How it works. Visible focus everywhere; focus returns to the trigger when a panel closes. *(Built: the strip comes first visually, so it comes first in focus order.)* |

## Copy rules for this page
- **No feeling words.** Nothing that states or implies how the student feels.
- **"Demo" and "replayed", never "live" or "connected".**
- **Neutral and brief.** One line per element.
- **Help link copy.** It does not say "if you're stressed". It simply offers help.

## Visual direction
- **Mode and tokens.** The page uses Operate mode, with the issue #2 tokens and the existing `--proposal-*` tokens in `globals.css`.
- **Inherit from the landing page.** It takes the colour meaning from `web/DESIGN.md`: Deep Iris for actions, Sage for evidence only, and Pencil for the demo band.
- **What to leave out.** The notebook-spread composition belongs to the landing page and does not need to carry over.
- **Hierarchy.** The start button is the single dominant element. The demo band is visibly present but lower contrast.

## Open questions for the team
1. Is "Start fresh" offered while a session is paused?
2. Does "Ask for help" open a standalone support panel, or start a session in help mode? The response-rule location is undecided (AGENTS §14 item 5).
3. Where does the demo record selector live: a dialog from the Dashboard, or a separate operator route?
4. Is there a logo mark or approved motif yet (issue #9)? Until there is, the wordmark only.

## Implementation outline (later task, not part of this doc's approval)
- `features/dashboard/`:
  - Remove `StressBadge`, `MetricCard`, `MetricsOverview`, `useDailyFeatures`, `dashboardService`.
  - Add organisms: `StudyStart` (primary action + status line + help), `DemoSourceBand` (indicator + explanation + record control) and `FirstVisitIntro`.
  - Add a `useSessionStatus` hook and a `useDemoRecord` hook.
- Session status must be shared without features importing each other, so put it in `lib/` (e.g. a small session store) or a provider in `components/`.
- `components/organisms/AppShell.tsx`:
  - Change the nav to Dashboard · Study Session · Preferences.
  - Retire the `self-report` feature/route once the check-in exists inside the session.
- Check with AGENTS §15 before finishing.
