import assert from "node:assert/strict";
import { before, test } from "node:test";
import type { Renderable } from "@opentui/core";
import { KeybindingsManager, setKeybindings } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";
import type { TreeNode } from "../../domain/tree/index.ts";
import { TreeOverlay } from "./tree-overlay.ts";

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

const nodes: TreeNode[] = [{
  id: "u1", kind: "user", text: "hello", children: [
    { id: "a1", kind: "assistant", text: "world", label: "ckpt",
      children: [{ id: "t1", kind: "tool", text: "toolcall", children: [] }] },
    { id: "a2", kind: "assistant", text: "bye", children: [] },
  ],
}];

before(() => { setKeybindings(new KeybindingsManager(APP_KEYBINDINGS)); });

const make = (leafId?: string) => {
  const selected: string[] = [];
  const edited: string[] = [];
  let cancelled = 0;
  const overlay = new TreeOverlay(
    {} as never, { nodes, ...(leafId !== undefined ? { leafId } : {}) }, new FakeRenderable() as never,
  );
  overlay.onSelect = (id) => void selected.push(id);
  overlay.onEditLabel = (id) => void edited.push(id);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, selected, edited, cancelled: () => cancelled, content: () => overlay.renderable.content };
};

test("rows render with fold markers, indent, and leaf marker on leafId", () => {
  const { content } = make("a2");
  const lines = content().split("\n");
  assert.match(lines[0]!, /^filter:default/);
  assert.ok(lines.some((l) => l.includes("▾") && l.includes("hello")));
  assert.ok(lines.some((l) => l.includes("▾") && l.includes("[ckpt]") && l.includes("world")));
  assert.ok(lines.some((l) => l.includes("· toolcall")));
  const leaf = lines.find((l) => l.includes("bye"));
  assert.ok(leaf?.includes("➤"));
  assert.ok(leaf?.startsWith("→ "));
});

test("foldOrUp folds the selected parent and hides children", () => {
  const { overlay, content } = make("a1");
  assert.ok(content().includes("toolcall"));
  overlay.handleInput("\x1b[1;5D"); // ctrl+left → foldOrUp
  assert.equal(content().includes("toolcall"), false);
  assert.ok(content().includes("▸"));
});

test("filter userOnly hides non-user rows and resets folding", () => {
  const { overlay, content } = make("a1");
  overlay.handleInput("\x1b[1;5D");
  assert.equal(content().includes("toolcall"), false);
  overlay.handleInput("\x15"); // ctrl+u → userOnly
  const body = content().split("\n").slice(1).join("\n");
  assert.match(content().split("\n")[0]!, /filter:userOnly/);
  assert.ok(body.includes("hello"));
  assert.equal(body.includes("world"), false);
  assert.equal(body.includes("toolcall"), false);
  assert.equal(body.includes("bye"), false);
});

test("typing narrows rows; cancel clears query first, then fires onCancel", () => {
  const { overlay, content, cancelled } = make("a2");
  for (const ch of "bye") overlay.handleInput(ch);
  assert.match(content().split("\n")[0]!, /bye/);
  assert.ok(content().includes("bye"));
  assert.equal(content().includes("hello"), false);
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 0);
  assert.ok(content().includes("hello"));
  overlay.handleInput("\x1b");
  assert.equal(cancelled(), 1);
});

test("confirm fires onSelect; editLabel fires onEditLabel", () => {
  const { overlay, selected, edited } = make("a2");
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["a2"]);
  overlay.handleInput("L"); // shift+l → editLabel
  assert.deepEqual(edited, ["a2"]);
});
