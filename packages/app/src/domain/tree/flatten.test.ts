import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenVisible } from "./flatten.ts";
import type { TreeNode } from "./types.ts";

const n = (partial: Partial<TreeNode> & Pick<TreeNode, "id" | "kind">): TreeNode => ({
  text: partial.text ?? partial.id,
  children: partial.children ?? [],
  ...partial,
});

describe("flattenVisible", () => {
  const tree: TreeNode[] = [
    n({
      id: "u1",
      kind: "user",
      children: [
        n({ id: "a1", kind: "assistant", children: [n({ id: "t1", kind: "tool", text: "tool" })] }),
        n({ id: "a2", kind: "assistant" }),
      ],
    }),
  ];

  it("skips descendants of folded nodes", () => {
    const rows = flattenVisible(tree, new Set(["a1"]), "all");
    assert.deepEqual(
      rows.map((r) => r.id),
      ["u1", "a1", "a2"],
    );
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

  // Upstream re-parents filtered nodes' children to nearest visible ancestor.
  // We promote: skip filtered node, walk children at the same depth.
  it("promotes children of filtered-out parents at the same depth", () => {
    const nodes = [
      n({
        id: "u",
        kind: "user",
        children: [
          n({
            id: "tool",
            kind: "tool",
            children: [n({ id: "child", kind: "assistant", text: "promoted" })],
          }),
        ],
      }),
    ];
    const rows = flattenVisible(nodes, new Set(), "noTools");
    assert.deepEqual(
      rows.map((r) => ({ id: r.id, depth: r.depth })),
      [
        { id: "u", depth: 0 },
        { id: "child", depth: 1 },
      ],
    );
  });

  it("default filter hides other but keeps tools", () => {
    const nodes = [
      n({
        id: "u",
        kind: "user",
        children: [n({ id: "o", kind: "other" }), n({ id: "t", kind: "tool" })],
      }),
    ];
    const ids = flattenVisible(nodes, new Set(), "default").map((r) => r.id);
    assert.deepEqual(ids, ["u", "t"]);
  });
});
