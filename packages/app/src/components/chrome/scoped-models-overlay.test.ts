import assert from "node:assert/strict";
import { before, test } from "node:test";
import type { Renderable } from "@opentui/core";
import { KeybindingsManager, setKeybindings } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";
import { ScopedModelsOverlay } from "./scoped-models-overlay.ts";

class FakeRenderable {
  content = "";
  visible = true;
  width?: number;
  options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}

const items = [
  { id: "openai/a", label: "openai/a", provider: "openai" },
  { id: "openai/b", label: "openai/b", provider: "openai" },
  { id: "anthropic/c", label: "anthropic/c", provider: "anthropic" },
];

before(() => {
  setKeybindings(new KeybindingsManager(APP_KEYBINDINGS));
});

const make = (initial: string[] | null = ["openai/a", "openai/b", "anthropic/c"]) => {
  const changes: Array<string[] | null> = [];
  const persisted: Array<string[] | null> = [];
  let cancelled = 0;
  const overlay = new ScopedModelsOverlay({} as never, { items, initial }, new FakeRenderable() as never);
  overlay.onChange = (enabled) => void changes.push(enabled);
  overlay.onPersist = (enabled) => void persisted.push(enabled);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, changes, persisted, cancelled: () => cancelled };
};

test("confirm toggles the highlighted model and fires onChange", () => {
  const { overlay, changes } = make(["openai/a", "openai/b", "anthropic/c"]);
  overlay.handleInput("\r");
  assert.deepEqual(changes, [["openai/b", "anthropic/c"]]);
});

test("enableAll with an active search only enables filtered ids", () => {
  const { overlay, changes } = make([]);
  for (const ch of "openai") overlay.handleInput(ch);
  overlay.handleInput("\x01"); // ctrl+a → app.models.enableAll
  assert.deepEqual(changes, [["openai/a", "openai/b"]]);
});

test("reorderDown moves the highlighted enabled id and onChange reflects order", () => {
  const { overlay, changes } = make(["openai/a", "openai/b", "anthropic/c"]);
  overlay.handleInput("\x1b[1;3B"); // alt+down → app.models.reorderDown
  assert.deepEqual(changes, [["openai/b", "openai/a", "anthropic/c"]]);
});

test("save fires onPersist; cancel clears query then fires onCancel", () => {
  const { overlay, persisted, cancelled } = make(["openai/a"]);
  overlay.handleInput("\x13"); // ctrl+s → app.models.save
  assert.deepEqual(persisted, [["openai/a"]]);
  for (const ch of "zz") overlay.handleInput(ch);
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 0);
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 1);
});
