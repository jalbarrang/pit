import assert from "node:assert/strict";
import { test } from "node:test";
import { createTheme } from "../../domain/theming/index.ts";
import { makeOverlay } from "./selector-overlay-fixture.ts";

test("arrow keys move selection and enter fires onSelect", () => {
  const { overlay, selected } = makeOverlay();
  overlay.handleInput("\x1b[B");
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["openai/gpt-5.5"]);
});

test("escape fires onCancel", () => {
  const { overlay, cancelled } = makeOverlay();
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 1);
});

test("initialIndex preselects", () => {
  const { overlay, selected } = makeOverlay({ initialIndex: 2 });
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["cursor/composer-2.5"]);
});

test("typing filters the list when searchable", () => {
  const { overlay, selected } = makeOverlay({ searchable: true });
  for (const ch of "gpt") overlay.handleInput(ch);
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["openai/gpt-5.5"]);
});

test("backspace widens the filter again", () => {
  const { overlay } = makeOverlay({ searchable: true });
  for (const ch of "zzz") overlay.handleInput(ch);
  assert.equal(overlay.list.selection.filteredItems.length, 0);
  for (let i = 0; i < 3; i++) overlay.handleInput("\x7f");
  assert.equal(overlay.list.selection.filteredItems.length, 3);
});

test("initialSearch pre-filters", () => {
  const { overlay, selected } = makeOverlay({ searchable: true, initialSearch: "composer" });
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["cursor/composer-2.5"]);
});

test("theme accessor stays working for overlay styling", () => {
  assert.ok(createTheme("dark").color("borderAccent"));
});
