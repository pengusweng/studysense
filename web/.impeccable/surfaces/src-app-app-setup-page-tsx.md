---
version: 1
slug: "src-app-app-setup-page-tsx"
primary_target: "src/app/(app)/setup/page.tsx"
related_targets: ["src/features/setup", "src/lib/consent.ts"]
---

# Setup surface brief

Scope: `/setup`, consent and setup (issue #3). Mode: **Operate**. A contextual flow, not a nav destination (AGENTS.md §4).

- **Audience and job:** a student on their first visit. Before the first session, they should learn what the demo works from and make one optional choice, then get on with studying.
- **User answers (2026-11-17):**
  - Layout: one notebook spread. Left page in the log voice: what is used. Right page: the choice.
  - Choices: check-in opt-in only ("During a session, may StudySense ask an occasional optional question?" Yes, now and then / No, keep quiet). Nothing preselected.
  - Entry: the first Dashboard visit. "Get started" replaces "Start a study session" until setup is done. Reopened from "What StudySense uses" on the Dashboard.
- **States built:** decline (a full answer), Back (saves nothing; goes to `/` the first time, `/dashboard` when reopened), resume (the draft pick survives a reload), reopen (current choice shown, "Done"), replay record unavailable (a note on the Record row; Continue stays enabled), storage blocked ("Your choice lasts for this page only."), not persisted ("Your choices last for this visit only.").
- **Constraints:** copy reuses facts already in the product (DemoSourceNote, the landing Data spread). No new claims. No device or "connected" language.

## Unresolved
- Persistence beyond the visit (AGENTS.md §14.7).
- Preferences (issue #7) should link back here and let the choice be changed there too.
