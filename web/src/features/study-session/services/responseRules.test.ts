import assert from "node:assert/strict";
import { test } from "node:test";
import type { FeedbackEntry } from "../../../lib/feedback";
import type { EstimateView } from "../types";
import { chooseResponse, type ResponseInput } from "./responseRules.ts";

const NONE: EstimateView = { kind: "unavailable", reason: "none" };
const MISSING: EstimateView = { kind: "missing" };
const HSHA: EstimateView = { kind: "estimate", profile: "HSHA", certainty: "confident" };
const HSHA_UNCERTAIN: EstimateView = { kind: "estimate", profile: "HSHA", certainty: "uncertain" };
const LSLA: EstimateView = { kind: "estimate", profile: "LSLA", certainty: "confident" };

const run = (input: Partial<ResponseInput>) =>
  chooseResponse({ estimate: NONE, checkIn: "unasked", history: [], ...input });

test("focused preserves flow, even with an elevated estimate", () => {
  assert.deepEqual(run({ checkIn: "focused", estimate: HSHA }), { kind: "silent", reason: "flow" });
});

test("skipped, dismissed and no response are never repeated", () => {
  for (const checkIn of ["skipped", "dismissed", "no_response"] as const) {
    assert.deepEqual(run({ checkIn, estimate: HSHA }), { kind: "silent", reason: "declined" });
  }
});

test("an estimate alone never prompts", () => {
  for (const estimate of [HSHA, HSHA_UNCERTAIN, NONE, MISSING]) {
    assert.deepEqual(run({ estimate }), { kind: "silent", reason: "abstain" });
  }
});

test("swamped with a confident HSHA estimate offers a smaller step, backed by both", () => {
  assert.deepEqual(run({ checkIn: "swamped", estimate: HSHA }), {
    kind: "offer",
    suggestion: "steps",
    basis: "check-in+estimate",
  });
});

test("swamped with any other estimate, or none, offers support on the check-in alone", () => {
  for (const estimate of [NONE, MISSING, LSLA, HSHA_UNCERTAIN]) {
    assert.deepEqual(run({ checkIn: "swamped", estimate }), { kind: "offer", suggestion: "steps", basis: "check-in" });
  }
});

test("correction 'fine, just busy' preserves flow", () => {
  assert.deepEqual(run({ checkIn: "swamped", correction: "fine" }), { kind: "silent", reason: "flow" });
});

test("correction 'more than this' offers something lighter", () => {
  assert.deepEqual(run({ checkIn: "swamped", correction: "more" }), {
    kind: "offer",
    suggestion: "lighter",
    basis: "correction",
  });
});

test("correction 'something else' opens the whole support list", () => {
  assert.deepEqual(run({ checkIn: "swamped", correction: "other" }), { kind: "support" });
});

test("a dismissed suggestion is skipped next time", () => {
  const history: FeedbackEntry[] = [{ suggestion: "steps", action: "dismiss" }];
  assert.deepEqual(run({ checkIn: "swamped", history }), { kind: "offer", suggestion: "break", basis: "check-in" });
});

test("an accepted suggestion is offered first", () => {
  const history: FeedbackEntry[] = [{ suggestion: "shorter", action: "accept" }];
  assert.deepEqual(run({ checkIn: "swamped", history }), { kind: "offer", suggestion: "shorter", basis: "check-in" });
});

test("when every suggestion was dismissed, the first is offered again rather than nothing", () => {
  const history: FeedbackEntry[] = (["steps", "break", "shorter", "lighter"] as const).map((suggestion) => ({
    suggestion,
    action: "dismiss",
  }));
  assert.deepEqual(run({ checkIn: "swamped", history }), { kind: "offer", suggestion: "steps", basis: "check-in" });
});
