import assert from "node:assert/strict";
import { test } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import { SelectorOverlay } from "./selector-overlay.ts";

class FakeRenderable {
  content = "";
  visible = true;
  options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}

const items = [
  { value: "anthropic/claude-opus-4-8", label: "anthropic/claude-opus-4-8" },
  { value: "openai/gpt-5.5", label: "openai/gpt-5.5" },
  { value: "cursor/composer-2.5", label: "cursor/composer-2.5" },
];

const makeOverlay = (options: { searchable?: boolean; initialSearch?: string; initialIndex?: number } = {}) => {
  const selected: string[] = [];
  let cancelled = 0;
  const overlay = new SelectorOverlay({} as never, { items, initialIndex: options.initialIndex ?? 0, ...options }, {
    box: new FakeRenderable() as never,
    list: new FakeRenderable() as never,
    search: new FakeRenderable() as never,
  });
  overlay.onSelect = (item) => void selected.push(item.value);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, selected, cancelled: () => cancelled };
};

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
