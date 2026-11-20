import assert from "node:assert/strict";
import { test } from "node:test";
import { ACADEMIC_NEEDS, CLARIFIERS, FOLLOWUPS, STRATEGIES, resolveNeed, strategiesFor } from "./academicSupport.ts";

test("Task 4.1 exposes exactly eight approved academic needs", () => {
  assert.deepEqual(ACADEMIC_NEEDS.map((x) => x.label), [
    "Understanding a topic", "Applying what I've learned", "Remembering information",
    "Getting started or organizing tasks", "Managing my energy or concentration",
    "Handling a heavy workload", "I'm not sure what I need", "Something else",
  ]);
});

test("every academic need provides predefined strategies", () => {
  for (const need of ACADEMIC_NEEDS) assert.ok(STRATEGIES[need.id].length > 0);
});

test("understanding and unsure clarifiers route to academic needs, not ML profile", () => {
  assert.ok(CLARIFIERS.understand);
  assert.ok(CLARIFIERS.unsure);
  assert.equal(resolveNeed("understand", "remember"), "remember");
  assert.equal(resolveNeed("unsure", "organize"), "organize");
  assert.equal(resolveNeed("understand", "concept"), "concept");
});


test("optional workload and energy follow-ups let the student choose priority", () => {
  assert.deepEqual(FOLLOWUPS.workload?.both?.options.map((x) => x.label), [
    "Pause first", "Organize tasks first", "See both options", "Continue studying",
  ]);
  assert.ok(FOLLOWUPS.energy?.lighter);
  assert.ok(FOLLOWUPS.organize?.priority);
});


test("voluntary follow-up choices change the available response priority", () => {
  assert.equal(strategiesFor("workload", "both", "pause")[0].id, "pause");
  assert.equal(strategiesFor("workload", "both", "organize")[0].id, "organize");
  assert.match(strategiesFor("energy", "lighter", "shorter")[0].text, /shorter study interval/);
  assert.match(strategiesFor("organize", "priority", "deadline")[0].text, /closest deadline/);
});
