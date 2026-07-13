import assert from "node:assert/strict";
import { test } from "node:test";
import { makeOverlay } from "./selector-overlay-fixture.ts";

test("tab fires onTab instead of reaching the list", () => {
  const { overlay } = makeOverlay();
  let tabs = 0;
  overlay.onTab = () => void (tabs += 1);
  overlay.handleInput("\t");
  assert.equal(tabs, 1);
});

test("tab without onTab is ignored", () => {
  const { overlay, selected } = makeOverlay();
  overlay.handleInput("\t");
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["anthropic/claude-opus-4-8"]);
});

test("setItems swaps the list and preselects the given index", () => {
  const { overlay, selected } = makeOverlay();
  overlay.setItems([{ value: "openai/gpt-5.5", label: "openai/gpt-5.5" }, { value: "openai/gpt-5-mini", label: "openai/gpt-5-mini" }], 1);
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["openai/gpt-5-mini"]);
});

test("setItems re-applies an active search filter", () => {
  const { overlay } = makeOverlay({ searchable: true });
  for (const ch of "gpt") overlay.handleInput(ch);
  overlay.setItems([{ value: "openai/gpt-5.5", label: "openai/gpt-5.5" }, { value: "cursor/composer-2.5", label: "cursor/composer-2.5" }]);
  assert.deepEqual(overlay.list.selection.filteredItems.map((item) => item.value), ["openai/gpt-5.5"]);
});

test("header renders and setHeader updates it without disturbing the list", () => {
  const { overlay } = makeOverlay({ header: "scope: scoped" });
  overlay.setHeader("scope: all");
  assert.equal(overlay.list.selection.filteredItems.length, 3);
});
