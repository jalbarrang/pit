import assert from "node:assert/strict";
import { test } from "node:test";
import { formatHttpIdle, httpIdleLabels, parseHttpIdle } from "./http-idle.ts";

test("http idle labels match pi's choices", () => {
  assert.deepEqual(httpIdleLabels(), ["30 sec", "1 min", "2 min", "5 min", "disabled"]);
});

test("format and parse round-trip every choice", () => {
  for (const label of httpIdleLabels()) {
    assert.equal(formatHttpIdle(parseHttpIdle(label)!), label);
  }
});

test("format falls back to seconds for unknown values", () => {
  assert.equal(formatHttpIdle(45_000), "45 sec");
  assert.equal(parseHttpIdle("nope"), undefined);
});
