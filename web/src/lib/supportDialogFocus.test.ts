import assert from "node:assert/strict";
import test from "node:test";
import { wrappedDialogFocusIndex } from "./supportDialogFocus.ts";

test("Tab wraps from the last dialog control to the first", () => {
  assert.equal(wrappedDialogFocusIndex(4, 4, false), 0);
});

test("Shift+Tab wraps from the first dialog control to the last", () => {
  assert.equal(wrappedDialogFocusIndex(0, 4, true), 4);
});

test("Shift+Tab from the initial panel focus reaches the last control", () => {
  assert.equal(wrappedDialogFocusIndex(-1, 4, true), 4);
});

test("Tab moves normally between interior controls", () => {
  assert.equal(wrappedDialogFocusIndex(2, 4, false), null);
  assert.equal(wrappedDialogFocusIndex(2, 4, true), null);
});

test("No focusable controls never wraps", () => {
  assert.equal(wrappedDialogFocusIndex(-1, -1, true), null);
  assert.equal(wrappedDialogFocusIndex(-1, -1, false), null);
});
