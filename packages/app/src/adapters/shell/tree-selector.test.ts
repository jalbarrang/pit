import assert from "node:assert/strict";
import { test } from "node:test";
import type { TreeOverlayOptions } from "../../components/chrome/tree-overlay.ts";
import type { TreeNode } from "../../domain/tree/types.ts";
import { TreeSelectors } from "./tree-selector.ts";

class FakeOverlay {
  onSelect?: (id: string) => void;
  onCancel?: () => void;
  onEditLabel?: (id: string) => void;
  readonly options: TreeOverlayOptions;
  constructor(options: TreeOverlayOptions) { this.options = options; }
  setWidth() {}
}

const node = (id: string): TreeNode => ({ id, kind: "user", text: "hi", children: [] });

const make = (session: Record<string, unknown> | undefined) => {
  const log: string[] = [];
  const overlays: FakeOverlay[] = [];
  const inputs: Array<{ prompt: string; onSubmit: (v: string) => void }> = [];
  const host = {
    tui: () => ({ ctx: {}, renderer: { width: 80 }, showOverlay: () => ({ hide: () => void log.push("hide") }) }) as never,
    session: () => session as never,
    notify: (text: string) => void log.push(text),
    replay: () => void log.push("replay"),
    switchSession: async (path: string) => void log.push(`switch:${path}`),
    openInput: (prompt: string, onSubmit: (v: string) => void) => { inputs.push({ prompt, onSubmit }); },
    setEditorText: (text: string) => void log.push(`editor:${text}`),
  };
  const selectors = new TreeSelectors(host, (_ctx, options) => {
    const overlay = new FakeOverlay(options);
    overlays.push(overlay);
    return overlay as never;
  });
  return { selectors, overlays, log, inputs };
};

test("openTree notifies when tree is unavailable", () => {
  const { selectors, log } = make({});
  selectors.openTree();
  assert.deepEqual(log, ["Session tree unavailable"]);
});

test("openTree shows overlay with nodes and leafId", () => {
  const nodes = [node("u1")];
  const { selectors, overlays } = make({ tree: () => nodes, leafId: () => "u1" });
  selectors.openTree();
  assert.equal(overlays.length, 1);
  assert.equal(overlays[0]!.options.nodes, nodes);
  assert.equal(overlays[0]!.options.leafId, "u1");
});

test("onSelect branches, replays, restores editorText, notifies", async () => {
  const { selectors, overlays, log } = make({
    tree: () => [node("u1")],
    leafId: () => "u1",
    branchTo: async (id: string) => { log.push(`branch:${id}`); return "edit me"; },
  });
  selectors.openTree();
  overlays[0]!.onSelect?.("u1");
  await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(log, ["hide", "branch:u1", "replay", "editor:edit me", "Branched"]);
});

test("onEditLabel routes through openInput to setLabel", () => {
  const { selectors, overlays, inputs, log } = make({
    tree: () => [node("u1")],
    setLabel: (id: string, label: string) => void log.push(`label:${id}:${label}`),
  });
  selectors.openTree();
  overlays[0]!.onEditLabel?.("u1");
  assert.equal(inputs[0]!.prompt, "Label");
  inputs[0]!.onSubmit("bookmark");
  assert.deepEqual(log, ["label:u1:bookmark", "Label saved"]);
});

test("onCancel hides the overlay", () => {
  const { selectors, overlays, log } = make({ tree: () => [node("u1")] });
  selectors.openTree();
  overlays[0]!.onCancel?.();
  assert.deepEqual(log, ["hide"]);
});

test("forkSession switches to forked path and notifies", async () => {
  const { selectors, log } = make({ forkSession: () => "/new/session.jsonl" });
  selectors.forkSession();
  await Promise.resolve();
  assert.deepEqual(log, ["switch:/new/session.jsonl", "Forked session"]);
});

test("forkSession notifies when unavailable", () => {
  const { selectors, log } = make({});
  selectors.forkSession();
  assert.deepEqual(log, ["Fork unavailable"]);
});
