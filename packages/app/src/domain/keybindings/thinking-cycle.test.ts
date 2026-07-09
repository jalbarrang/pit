import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { nextThinkingLevel } from "./thinking-cycle.ts";

describe("nextThinkingLevel", () => {
  it("cycles forward and wraps around", () => {
    const levels = ["off", "low", "high"];
    assert.equal(nextThinkingLevel(levels, "off"), "low");
    assert.equal(nextThinkingLevel(levels, "low"), "high");
    assert.equal(nextThinkingLevel(levels, "high"), "off");
  });

  it("returns current when levels are empty", () => {
    assert.equal(nextThinkingLevel([], "high"), "high");
  });

  it("returns first level when current is unknown", () => {
    assert.equal(nextThinkingLevel(["off", "low", "high"], "gone"), "off");
  });

  it("stays on the single level", () => {
    assert.equal(nextThinkingLevel(["high"], "high"), "high");
  });
});
