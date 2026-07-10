import type { TreeNode } from "./types.ts";

export type TreeFilter = "default" | "noTools" | "userOnly" | "labeledOnly" | "all";

/** Cycle order matches upstream tree-selector filter modes. */
const ORDER: TreeFilter[] = ["default", "noTools", "userOnly", "labeledOnly", "all"];

/**
 * Upstream default hides settings/bookkeeping (our `other`); tools stay visible.
 * `noTools` is default minus tool results. Callers reset folding on filter change.
 */
export function nodeVisible(filter: TreeFilter, node: TreeNode): boolean {
  switch (filter) {
    case "userOnly":
      return node.kind === "user";
    case "labeledOnly":
      return node.label !== undefined;
    case "all":
      return true;
    case "noTools":
      return node.kind !== "tool" && node.kind !== "other";
    default:
      return node.kind !== "other";
  }
}

export function cycleFilter(filter: TreeFilter, dir: 1 | -1): TreeFilter {
  const i = ORDER.indexOf(filter);
  const idx = i < 0 ? 0 : i;
  return ORDER[(idx + dir + ORDER.length) % ORDER.length]!;
}
