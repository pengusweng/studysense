# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

University students whose workload, fatigue, physiological arousal and perceived stress change across a term, especially around exams and deadlines. They use StudySense while studying.

The landing page has a second, confirmed audience: the course panel and classmates evaluating the project. They need to understand the idea before opening the demo.

## Product Purpose

StudySense is a web-based, non-clinical academic support tool. It replays existing wearable-derived data and shows a tentative daily stress-anxiety estimate from a machine learning model. It can optionally ask the student how studying is going, then either offers light support or stays quiet. The student can accept, dismiss or correct anything it suggests.

Success is a study experience that is more sensitive to context and fits the person better. It is not a claim about grades, stress reduction, burnout or mental health, which would need separate empirical validation.

## Positioning

Wearable data is evidence, not emotional truth. The same rise in physiological arousal can mean stress, focus, excitement or recent exercise (van der Mee et al., 2025). So StudySense asks before it assumes, lets the student's own reading override the sensor, and treats not interrupting as a valid, designed outcome. A timer or planner only responds to the clock. StudySense changes whether, when and how it responds based on evidence the student helps interpret.

## Operating Context

- **Core journey:** entry and consent → start study → SSAQS demo replay → tentative daily estimate → optional check-in → rule-based response or silence → feedback (accept, dismiss or correct) → the next interaction uses that feedback.
- **Persistent destinations:** exactly three: Dashboard, Study Session and Preferences. Everything else is a contextual flow.

## Capabilities and Constraints

- **Stack:** Next.js 15 App Router, React 19 and TypeScript strict, with feature-based atomic architecture (see `docs/AGENTS.md` §11). Don't add npm dependencies without asking.
- **Profiles:** four estimated daily profiles: LSLA, LSHA, HSLA and HSHA. Each comes from splitting the 0–100 self-reports at 50. That threshold is operational for the course, not clinical.
- **Responses:** chosen by rules from predefined templates. There are no generative or LLM responses.
- **Data:** the MVP replays offline SSAQS records. There is no live sensing, device pairing or wearable API.
- **Undecided:** the uncertainty output format, the check-in pattern, timer and task-list features, and the rules for LSLA, LSHA and HSLA.

## Brand Commitments

- **Character:** *Soft Intelligence*: thoughtful, calm, discreet and student-controlled. The tone is calm and non-clinical, and uncertainty uses light visual language, not alarm styling.
- **Colour tokens (design issue #2):** Cloud White `#FAF8FE`, Pale Lavender `#F2EDFB`, Iris `#7759BA`, Deep Iris `#60449D`, Ink `#29243B`, Sage `#A8CFC7`.
- **Brand assets:** a wordmark, logo mark and favicon are still to come. One restrained signature motif may appear at two or three touchpoints. A mascot is unapproved.

## Evidence on Hand

- The SSAQS dataset (Students' Stress and Anxiety Questionnaires & Sensors) covers 35 university students from February to July 2025.
  - Wearable: Fitbit Inspire 3.
  - Signals: steps, activity level, HRV, SpO2, sleep and a daily Fitbit stress score.
  - Self-reports: daily stress and anxiety ratings from 0 to 100.
  - Loaded data: 3,618 participant-days in `clean.daily_features`, of which 2,291 are ML-ready, with both sensor data and labels.
- Research citation: van der Mee et al., 2025, on Garmin stress score and arousal.
- **Absent, so do not fabricate:** testimonials, user counts, accuracy or confidence figures, outcome metrics, partner logos, press, licensing and production deployment.

## Product Principles

1. Ask before assuming. Sensor data is evidence the student interprets.
2. Silence is a designed state, not a missing screen.
3. Everything optional stays optional, with no penalty for skipping.
4. Never overclaim: no diagnosis, no fake live sensing and no "the system learned".
5. Help is always reachable, whatever the estimate, including when there is none.

## Accessibility & Inclusion

WCAG 2.2 AA contrast, visible keyboard focus, meaning never carried by colour alone, `prefers-reduced-motion` respected, and no horizontal overflow on narrow mobile.
