import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenVisible } from "./flatten.ts";
import type { TreeNode } from "./types.ts";

const n = (partial: Partial<TreeNode> & Pick<TreeNode, "id" | "kind">): TreeNode => ({
  text: partial.text ?? partial.id, children: partial.children ?? [], ...partial,
});
const rows = (nodes: TreeNode[]) =>
  flattenVisible(nodes, new Set(), "all").map((r) => ({ id: r.id, depth: r.depth, text: r.text, label: r.label }));

describe("flattenVisible empty-text", () => {
  it("skips empty-text non-branch nodes; children take their place at same depth", () => {
    const nodes = [n({ id: "u", kind: "user", text: "hi", children: [
      n({ id: "empty", kind: "assistant", text: "  ", children: [n({ id: "leaf", kind: "user", text: "ok" })] }),
    ] })];
    assert.deepEqual(rows(nodes), [
      { id: "u", depth: 0, text: "hi", label: undefined },
      { id: "leaf", depth: 0, text: "ok", label: undefined },
    ]);
  });

  it("empty-text branch points render as (kind) and indent children", () => {
    const nodes = [n({ id: "empty", kind: "assistant", text: "", children: [
      n({ id: "c1", kind: "user", text: "a" }), n({ id: "c2", kind: "user", text: "b" }),
    ] })];
    assert.deepEqual(rows(nodes), [
      { id: "empty", depth: 0, text: "(assistant)", label: undefined },
      { id: "c1", depth: 1, text: "a", label: undefined },
      { id: "c2", depth: 1, text: "b", label: undefined },
    ]);
  });

  it("empty skipped nodes compose with branch depth on the effective parent", () => {
    const nodes = [n({ id: "u", kind: "user", text: "root", children: [
      n({ id: "e1", kind: "assistant", text: "", children: [n({ id: "a1", kind: "user", text: "one" })] }),
      n({ id: "e2", kind: "assistant", text: "\t", children: [n({ id: "a2", kind: "user", text: "two" })] }),
    ] })];
    assert.deepEqual(
      flattenVisible(nodes, new Set(), "all").map((r) => ({ id: r.id, depth: r.depth })),
      [{ id: "u", depth: 0 }, { id: "a1", depth: 1 }, { id: "a2", depth: 1 }],
    );
  });

  it("keeps empty-text nodes that have a label", () => {
    const nodes = [n({ id: "u", kind: "user", text: "hi", children: [
      n({ id: "labeled", kind: "assistant", text: "", label: "ckpt" }),
    ] })];
    assert.deepEqual(rows(nodes), [
      { id: "u", depth: 0, text: "hi", label: undefined },
      { id: "labeled", depth: 0, text: "", label: "ckpt" },
    ]);
  });
});
