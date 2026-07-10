import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { flattenVisible } from "./flatten.ts";
import { foldOrUp, moveSelection, unfoldOrDown, type TreeNavState } from "./navigate.ts";
import type { TreeNode } from "./types.ts";

const n = (partial: Partial<TreeNode> & Pick<TreeNode, "id" | "kind">): TreeNode => ({
  text: partial.text ?? partial.id,
  children: partial.children ?? [],
  ...partial,
});

const tree: TreeNode[] = [
  n({
    id: "root",
    kind: "user",
    children: [
      n({ id: "branch", kind: "assistant", children: [n({ id: "leaf", kind: "assistant" })] }),
      n({ id: "sib", kind: "assistant" }),
    ],
  }),
];

const open = () => flattenVisible(tree, new Set(), "all");
const state = (selectedId: string, folded: string[] = []): TreeNavState => ({
  folded: new Set(folded),
  selectedId,
});

describe("foldOrUp", () => {
  it("folds an unfolded foldable row; re-flatten hides children", () => {
    const rows = open();
    const next = foldOrUp(state("branch"), rows);
    assert.ok(next.folded.has("branch"));
    assert.equal(next.selectedId, "branch");
    const hidden = flattenVisible(tree, next.folded, "all");
    assert.equal(hidden.some((r) => r.id === "leaf"), false);
  });

  it("on a leaf moves up to the previous fold-point", () => {
    const rows = open();
    const next = foldOrUp(state("leaf"), rows);
    assert.equal(next.selectedId, "branch");
    assert.equal(next.folded.size, 0);
  });

  it("clamps at the first row when nothing above is foldable", () => {
    const rows = open();
    const next = foldOrUp(state("root", ["root"]), rows.map((r) =>
      r.id === "root" ? { ...r, folded: true } : r,
    ));
    assert.equal(next.selectedId, "root");
  });
});

describe("unfoldOrDown", () => {
  it("unfolds a folded row", () => {
    const folded = flattenVisible(tree, new Set(["branch"]), "all");
    const next = unfoldOrDown(state("branch", ["branch"]), folded);
    assert.equal(next.folded.has("branch"), false);
    assert.ok(flattenVisible(tree, next.folded, "all").some((r) => r.id === "leaf"));
  });

  it("otherwise moves to the next fold-point or clamps at last", () => {
    const rows = open();
    assert.equal(unfoldOrDown(state("root"), rows).selectedId, "branch");
    assert.equal(unfoldOrDown(state("sib"), rows).selectedId, "sib");
  });
});

describe("moveSelection", () => {
  it("clamps at both ends", () => {
    const rows = open();
    assert.equal(moveSelection(state("root"), rows, -1).selectedId, "root");
    assert.equal(moveSelection(state("sib"), rows, 1).selectedId, "sib");
    assert.equal(moveSelection(state("root"), rows, 1).selectedId, "branch");
  });
});
