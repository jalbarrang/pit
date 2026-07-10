import { nodeVisible, type TreeFilter } from "./filters.ts";
import type { TreeNode } from "./types.ts";

export interface TreeRow {
  id: string;
  depth: number;
  text: string;
  label?: string;
  timestamp?: number;
  kind: TreeNode["kind"];
  hasChildren: boolean;
  folded: boolean;
}

/** True if any descendant would surface as a visible child (after filter promotion). */
const hasVisibleChild = (node: TreeNode, filter: TreeFilter): boolean => {
  for (const child of node.children) {
    if (nodeVisible(filter, child)) return true;
    if (hasVisibleChild(child, filter)) return true;
  }
  return false;
};

/**
 * Depth-first visible rows. Filtered-out nodes are skipped; their children are
 * still walked at the same depth (promoted) — mirrors upstream re-parenting to
 * the nearest visible ancestor, without its indent recalculation baroque.
 * Children of a folded node are skipped entirely. Pass CURRENT folded+filter;
 * after fold/unfold, re-call with the updated set.
 */
export function flattenVisible(
  nodes: TreeNode[],
  folded: ReadonlySet<string>,
  filter: TreeFilter,
): TreeRow[] {
  const rows: TreeRow[] = [];
  const walk = (list: TreeNode[], depth: number): void => {
    for (const node of list) {
      if (!nodeVisible(filter, node)) {
        walk(node.children, depth);
        continue;
      }
      const hasChildren = hasVisibleChild(node, filter);
      const isFolded = folded.has(node.id);
      rows.push({
        id: node.id,
        depth,
        text: node.text,
        ...(node.label !== undefined ? { label: node.label } : {}),
        ...(node.timestamp !== undefined ? { timestamp: node.timestamp } : {}),
        kind: node.kind,
        hasChildren,
        folded: isFolded,
      });
      if (!isFolded) walk(node.children, depth + 1);
    }
  };
  walk(nodes, 0);
  return rows;
}
