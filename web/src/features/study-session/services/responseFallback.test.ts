import assert from "node:assert/strict";
import { test } from "node:test";
import { fallbackResponse } from "./responseFallback.ts";

test("asking for a hand still opens the support list", () => {
  assert.deepEqual(fallbackResponse("swamped"), { kind: "support" });
});

test("a correction asking for more, or something else, opens the support list", () => {
  assert.deepEqual(fallbackResponse("swamped", "more"), { kind: "support" });
  assert.deepEqual(fallbackResponse("swamped", "other"), { kind: "support" });
});

test("'fine, just busy' and focused preserve flow", () => {
  assert.deepEqual(fallbackResponse("swamped", "fine"), { kind: "silent", reason: "flow" });
  assert.deepEqual(fallbackResponse("focused"), { kind: "silent", reason: "flow" });
});

test("declined and unasked stay quiet", () => {
  for (const checkIn of ["skipped", "dismissed", "no_response"] as const) {
    assert.deepEqual(fallbackResponse(checkIn), { kind: "silent", reason: "declined" });
  }
  assert.deepEqual(fallbackResponse("unasked"), { kind: "silent", reason: "abstain" });
});
