import { nodeVisible, type TreeFilter } from "./filters.ts";
import type { TreeNode } from "./types.ts";

export interface TreeRow {
  id: string;
  /** Indent level: +1 only under real branch points (2+ visible children), else flat. */
  depth: number;
  text: string;
  label?: string;
  timestamp?: number;
  kind: TreeNode["kind"];
  hasChildren: boolean;
  folded: boolean;
}

const isBlank = (node: TreeNode): boolean =>
  node.text.trim().length === 0 && node.label === undefined;

/**
 * Depth-first visible rows. Filtered-out and blank non-branch nodes are skipped
 * (children promoted to the effective parent). Blank branch points render as
 * `(${kind})`. Depth stays flat along single-child runs; +1 only when the
 * parent has 2+ effective visible children. Folded nodes hide descendants.
 */
export function flattenVisible(
  nodes: TreeNode[],
  folded: ReadonlySet<string>,
  filter: TreeFilter,
): TreeRow[] {
  const expand = (list: TreeNode[]): TreeNode[] => {
    const out: TreeNode[] = [];
    for (const child of list) {
      if (!nodeVisible(filter, child)) {
        out.push(...expand(child.children));
        continue;
      }
      const kids = expand(child.children);
      if (isBlank(child) && kids.length < 2) {
        out.push(...kids);
        continue;
      }
      out.push(child);
    }
    return out;
  };

  const rows: TreeRow[] = [];
  const walk = (list: TreeNode[], depth: number): void => {
    for (const node of expand(list)) {
      const kids = expand(node.children);
      const isFolded = folded.has(node.id);
      rows.push({
        id: node.id,
        depth,
        text: isBlank(node) ? `(${node.kind})` : node.text,
        ...(node.label !== undefined ? { label: node.label } : {}),
        ...(node.timestamp !== undefined ? { timestamp: node.timestamp } : {}),
        kind: node.kind,
        hasChildren: kids.length > 0,
        folded: isFolded,
      });
      if (!isFolded) walk(node.children, kids.length >= 2 ? depth + 1 : depth);
    }
  };
  walk(nodes, 0);
  return rows;
}
