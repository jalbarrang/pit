import assert from "node:assert/strict";
import { before, test } from "node:test";
import { KeybindingsManager, setKeybindings } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";
import type { TreeFilter, TreeNode } from "../../domain/tree/index.ts";
import { TreeOverlay } from "./tree-overlay.ts";

class FakeRenderable {
  content = ""; visible = true; width?: number; options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
}

const nodes: TreeNode[] = [{
  id: "u1", kind: "user", text: "hello", children: [
    { id: "a1", kind: "assistant", text: "world", label: "ckpt",
      children: [{ id: "t1", kind: "tool", text: "toolcall", children: [] }] },
    { id: "a2", kind: "assistant", text: "bye", children: [] },
  ],
}];

before(() => { setKeybindings(new KeybindingsManager(APP_KEYBINDINGS)); });

export const make = (opts: { leafId?: string; nodes?: TreeNode[]; maxVisible?: number; initialFilter?: TreeFilter } = {}) => {
  const selected: string[] = [];
  const edited: string[] = [];
  let cancelled = 0;
  const body = new FakeRenderable();
  const overlay = new TreeOverlay({} as never, {
    nodes: opts.nodes ?? nodes,
    ...(opts.leafId !== undefined ? { leafId: opts.leafId } : {}),
    ...(opts.maxVisible !== undefined ? { maxVisible: opts.maxVisible } : {}),
    ...(opts.initialFilter !== undefined ? { initialFilter: opts.initialFilter } : {}),
  }, { box: new FakeRenderable() as never, body: body as never });
  overlay.onSelect = (id) => void selected.push(id);
  overlay.onEditLabel = (id) => void edited.push(id);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, selected, edited, cancelled: () => cancelled, content: () => body.content };
};

export const TREE_HINT =
  "enter branch · ctrl+←→ fold · ctrl+d/t/u/l/a filter · shift+l label · shift+t times";

test("rows render with fold markers, indent, title, and leaf marker", () => {
  const { content } = make({ leafId: "a2" });
  const lines = content().split("\n");
  assert.match(lines[0]!, /^Session tree · filter:default/);
  assert.ok(lines.some((l) => l.includes("▾") && l.includes("hello")));
  assert.ok(lines.some((l) => l.includes("▾") && l.includes("[ckpt]") && l.includes("world")));
  assert.ok(lines.some((l) => l.includes("· toolcall")));
  const leaf = lines.find((l) => l.includes("bye"));
  assert.ok(leaf?.includes("➤") && leaf?.startsWith("→ "));
  assert.equal(lines.at(-1), TREE_HINT);
});

test("foldOrUp folds the selected parent and hides children", () => {
  const { overlay, content } = make({ leafId: "a1" });
  assert.ok(content().includes("toolcall"));
  overlay.handleInput("\x1b[1;5D");
  assert.equal(content().includes("toolcall"), false);
  assert.ok(content().includes("▸"));
});

test("filter userOnly hides non-user rows and title reflects filter", () => {
  const { overlay, content } = make({ leafId: "a1" });
  overlay.handleInput("\x1b[1;5D");
  overlay.handleInput("\x15");
  const body = content().split("\n").slice(1).join("\n");
  assert.match(content().split("\n")[0]!, /Session tree · filter:userOnly/);
  assert.ok(body.includes("hello"));
  assert.equal(body.includes("world") || body.includes("toolcall") || body.includes("bye"), false);
});

test("typing narrows rows; cancel clears query first, then fires onCancel", () => {
  const { overlay, content, cancelled } = make({ leafId: "a2" });
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
  const { overlay, selected, edited } = make({ leafId: "a2" });
  overlay.handleInput("\r");
  assert.deepEqual(selected, ["a2"]);
  overlay.handleInput("L");
  assert.deepEqual(edited, ["a2"]);
});

test("initialFilter starts the tree on the configured filter", () => {
  const { content } = make({ initialFilter: "userOnly" });
  assert.match(content().split("\n")[0]!, /filter:userOnly/);
  assert.equal(content().includes("toolcall"), false);
});
