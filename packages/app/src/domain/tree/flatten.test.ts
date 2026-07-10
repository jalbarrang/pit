import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenVisible } from "./flatten.ts";
import type { TreeNode } from "./types.ts";

const n = (partial: Partial<TreeNode> & Pick<TreeNode, "id" | "kind">): TreeNode => ({
  text: partial.text ?? partial.id, children: partial.children ?? [], ...partial,
});
const depths = (nodes: TreeNode[], folded: ReadonlySet<string> = new Set(), filter: "all" | "noTools" | "default" = "all") =>
  flattenVisible(nodes, folded, filter).map((r) => ({ id: r.id, depth: r.depth }));

const tree: TreeNode[] = [
  n({ id: "u1", kind: "user", children: [
    n({ id: "a1", kind: "assistant", children: [n({ id: "t1", kind: "tool", text: "tool" })] }),
    n({ id: "a2", kind: "assistant" }),
  ] }),
];

describe("flattenVisible depth + fold + filter", () => {
  it("linear chain stays flat at depth 0", () => {
    const chain = [n({ id: "a", kind: "user", children: [
      n({ id: "b", kind: "assistant", children: [
        n({ id: "c", kind: "user", children: [
          n({ id: "d", kind: "assistant", children: [n({ id: "e", kind: "user" })] }),
        ] }),
      ] }),
    ] })];
    assert.deepEqual(depths(chain), [
      { id: "a", depth: 0 }, { id: "b", depth: 0 }, { id: "c", depth: 0 },
      { id: "d", depth: 0 }, { id: "e", depth: 0 },
    ]);
  });

  it("branch point indents children; linear descendants stay flat", () => {
    assert.deepEqual(depths(tree), [
      { id: "u1", depth: 0 }, { id: "a1", depth: 1 }, { id: "t1", depth: 1 }, { id: "a2", depth: 1 },
    ]);
  });

  it("nested branch points deepen further", () => {
    const nodes = [n({ id: "r", kind: "user", children: [
      n({ id: "b1", kind: "assistant", children: [
        n({ id: "c1", kind: "user", children: [n({ id: "d1", kind: "assistant" })] }),
        n({ id: "c2", kind: "user" }),
      ] }),
      n({ id: "b2", kind: "assistant" }),
    ] })];
    assert.deepEqual(depths(nodes), [
      { id: "r", depth: 0 }, { id: "b1", depth: 1 }, { id: "c1", depth: 2 },
      { id: "d1", depth: 2 }, { id: "c2", depth: 2 }, { id: "b2", depth: 1 },
    ]);
  });

  it("skips descendants of folded nodes", () => {
    const rows = flattenVisible(tree, new Set(["a1"]), "all");
    assert.deepEqual(rows.map((r) => r.id), ["u1", "a1", "a2"]);
    assert.equal(rows.find((r) => r.id === "a1")!.folded, true);
  });

  it("hasChildren reflects visible children; fold hides them after re-flatten", () => {
    const open = flattenVisible(tree, new Set(), "all");
    assert.equal(open.find((r) => r.id === "a1")!.hasChildren, true);
    assert.ok(open.some((r) => r.id === "t1"));
    const closed = flattenVisible(tree, new Set(["a1"]), "all");
    assert.equal(closed.some((r) => r.id === "t1"), false);
    assert.equal(closed.find((r) => r.id === "a1")!.hasChildren, true);
  });

  it("promotes children of filtered-out parents at the same depth", () => {
    const nodes = [n({ id: "u", kind: "user", children: [
      n({ id: "tool", kind: "tool", children: [n({ id: "child", kind: "assistant", text: "promoted" })] }),
    ] })];
    assert.deepEqual(depths(nodes, new Set(), "noTools"), [
      { id: "u", depth: 0 }, { id: "child", depth: 0 },
    ]);
  });

  it("default filter hides other but keeps tools", () => {
    const nodes = [n({ id: "u", kind: "user", children: [
      n({ id: "o", kind: "other" }), n({ id: "t", kind: "tool" }),
    ] })];
    assert.deepEqual(flattenVisible(nodes, new Set(), "default").map((r) => r.id), ["u", "t"]);
  });
});
