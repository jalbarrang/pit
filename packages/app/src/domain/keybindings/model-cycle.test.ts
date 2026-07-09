import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ModelRef } from "../ports.ts";
import { nextModel } from "./model-cycle.ts";

const models: ModelRef[] = [
  { provider: "anthropic", id: "claude-opus-4-8" },
  { provider: "openai", id: "gpt-5.5" },
  { provider: "google", id: "gemini-2.5" },
];

describe("nextModel", () => {
  it("cycles forward and wraps around", () => {
    assert.deepEqual(nextModel(models, models[0]!, 1), models[1]);
    assert.deepEqual(nextModel(models, models[2]!, 1), models[0]);
  });

  it("cycles backward and wraps around", () => {
    assert.deepEqual(nextModel(models, models[1]!, -1), models[0]);
    assert.deepEqual(nextModel(models, models[0]!, -1), models[2]);
  });

  it("returns null when fewer than 2 models", () => {
    assert.equal(nextModel([models[0]!], models[0]!, 1), null);
    assert.equal(nextModel([], models[0]!, 1), null);
  });

  it("returns null when current is not in the list", () => {
    assert.equal(nextModel(models, { provider: "gone", id: "model" }, 1), null);
  });
});
