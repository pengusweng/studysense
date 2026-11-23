# Issue #13 — Study session scaling and support-panel regression checks

Scope: `https://github.com/pengusweng/studysense/issues/13`; Role 3 SS-B02, SS-E55, SS-C15.

The support panel is now portalled to `document.body` as an accessible dialog, bounded by the visual viewport and internally scrollable. Its exit/back actions are sticky. Study-session content is no longer clipped by the parent `overflow: hidden`; its animated `TideField` still clips its own decorative ruling.

## Manual browser acceptance matrix (record actual results before resolving #13)

1. Test desktop 1440x900 and 1366x768 at 100% zoom; open support from **Ready**, **Studying**, **Paused** and **Session ended** screens. Every eight-option panel must be scrollable and **Return to studying** must be reachable and actually close the dialog.
2. Test short window 900x500, 375x667 mobile and 320x568 mobile. Check no horizontal overflow and that both dialog actions and session **Pause / Resume / End** controls are reachable by ordinary scrolling.
3. At desktop browser zoom 200% and 400%, check the same behavior without using browser zoom-out as a workaround. Document the effective CSS viewport size.
4. Keyboard only: **Ask for support** opens and focuses the dialog; Tab and Shift+Tab never escape behind it; Escape closes and restores focus to **Ask for support**; **Return to studying** also closes and restores focus; background controls cannot be clicked while the modal is open.
5. Verify **See support options** bypasses clarification; four general options appear; **Back to support question** resets; the eight academic needs remain accessible.
6. Test with check-ins opted out and opted in. A closed panel must not alter consent, ML inference, check-in state or session phase.
7. Test reduced motion and screen-reader semantics (`role=dialog`, accessible heading, `aria-modal=true`); inspect browser Console for hydration and focus errors.
8. If any case fails, keep #13 open, log viewport/zoom, actual behavior, screenshots and commit SHA. Do not mark SS-B02 or SS-E55 PASS solely from static tests or source review.

## Automated regression

From `web/`, run `npm test` (includes `src/lib/supportDialogFocus.test.ts`), then `npm run build`. These are necessary but not sufficient: responsive viewport and user-interaction checks above must still be performed.

## Research evidence boundary

The pre-fix screenshots and Role 3 failures remain in the Task 8 tracker under the original SHA. Retests must use the new commit SHA; do not overwrite original observations or claim all 58 cases are complete because this UI defect was fixed.
