import assert from "node:assert/strict";
import { test } from "node:test";
import { ChromeSelectors } from "./selectors.ts";
import { makeHost, settle } from "./selectors-fixture.ts";

test("openModel shows searchable overlay preselecting current model", () => {
  const { selectors, overlays } = makeHost();
  selectors.openModel("gpt");
  assert.equal(overlays.length, 1);
  assert.equal(overlays[0]!.options.searchable, true);
  assert.equal(overlays[0]!.options.initialSearch, "gpt");
  assert.equal(overlays[0]!.options.initialIndex, 1);
});

test("selecting a model applies it, notifies, refreshes footer, hides overlay", async () => {
  const { selectors, log, overlays, hidden } = makeHost();
  selectors.openModel("");
  overlays[0]!.onSelect?.({ value: "anthropic/claude-opus-4-8", label: "x" });
  await settle();
  assert.equal(hidden(), 1);
  assert.deepEqual(log, ["setModel:anthropic/claude-opus-4-8", "notify:Model: anthropic/claude-opus-4-8", "footer"]);
});

test("openThinking lists levels and applies selection", async () => {
  const { selectors, log, overlays } = makeHost();
  selectors.openThinking();
  assert.deepEqual(overlays[0]!.options.items.map((item) => item.value), ["off", "low", "high"]);
  assert.equal(overlays[0]!.options.initialIndex, 2);
  overlays[0]!.onSelect?.({ value: "low", label: "low" });
  await settle();
  assert.deepEqual(log, ["setThinking:low", "notify:Thinking: low", "footer"]);
});

test("cancel hides without applying", () => {
  const { selectors, log, overlays, hidden } = makeHost();
  selectors.openThinking();
  overlays[0]!.onCancel?.();
  assert.equal(hidden(), 1);
  assert.deepEqual(log, []);
});

test("no session notifies instead of opening", () => {
  const { log, overlays } = makeHost();
  const selectors = new ChromeSelectors({ tui: () => ({}) as never, session: () => undefined, notify: (t) => void log.push(t), refreshFooter: () => {} });
  selectors.openModel("");
  selectors.openThinking();
  assert.equal(overlays.length, 0);
  assert.equal(log.length, 2);
});
