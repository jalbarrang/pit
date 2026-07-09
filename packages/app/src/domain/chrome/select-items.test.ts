import assert from "node:assert/strict";
import { test } from "node:test";
import { findModel, modelKey, modelSelectItems } from "./model-select.ts";
import { thinkingSelectItems } from "./thinking-select.ts";

const models = [
  { provider: "anthropic", id: "claude-opus-4-8" },
  { provider: "openai", id: "gpt-5.5" },
];

test("model items use provider/id keys and preselect the current model", () => {
  const { items, initialIndex } = modelSelectItems(models, "openai/gpt-5.5");
  assert.deepEqual(items.map((item) => item.value), ["anthropic/claude-opus-4-8", "openai/gpt-5.5"]);
  assert.equal(initialIndex, 1);
  assert.match(items[1]!.description ?? "", /current/);
  assert.equal(items[0]!.description, undefined);
});

test("model items fall back to first entry when current is unknown", () => {
  const { initialIndex } = modelSelectItems(models, "gone/model");
  assert.equal(initialIndex, 0);
});

test("findModel resolves a selection key back to the model ref", () => {
  assert.deepEqual(findModel(models, "openai/gpt-5.5"), models[1]);
  assert.equal(findModel(models, "nope/nope"), undefined);
  assert.equal(modelKey(models[0]!), "anthropic/claude-opus-4-8");
});

test("thinking items describe each available level and preselect current", () => {
  const { items, initialIndex } = thinkingSelectItems(["off", "low", "high"], "high");
  assert.deepEqual(items.map((item) => item.value), ["off", "low", "high"]);
  assert.equal(initialIndex, 2);
  for (const item of items) assert.ok((item.description ?? "").length > 0, `${item.value} missing description`);
});

test("thinking items tolerate unknown levels and missing current", () => {
  const { items, initialIndex } = thinkingSelectItems(["off", "custom"]);
  assert.equal(initialIndex, 0);
  assert.equal(items[1]!.label, "custom");
});
