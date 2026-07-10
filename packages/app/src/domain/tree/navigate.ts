import type { TreeRow } from "./flatten.ts";

export interface TreeNavState {
  folded: ReadonlySet<string>;
  selectedId: string | undefined;
}

const indexOf = (rows: TreeRow[], id: string | undefined): number => {
  if (id === undefined || rows.length === 0) return 0;
  const i = rows.findIndex((r) => r.id === id);
  return i < 0 ? 0 : i;
};

/**
 * Rows must be the CURRENT visible list from flattenVisible.
 * After fold/unfold changes `folded`, the caller must re-flatten before the next nav call.
 */
export function foldOrUp(state: TreeNavState, rows: TreeRow[]): TreeNavState {
  if (rows.length === 0) return state;
  const i = indexOf(rows, state.selectedId);
  const row = rows[i]!;
  if (row.hasChildren && !row.folded) {
    const folded = new Set(state.folded);
    folded.add(row.id);
    return { folded, selectedId: row.id };
  }
  for (let j = i - 1; j >= 0; j--) {
    if (rows[j]!.hasChildren) return { folded: state.folded, selectedId: rows[j]!.id };
  }
  return { folded: state.folded, selectedId: rows[0]!.id };
}

/** See foldOrUp — re-flatten after unfold before further navigation. */
export function unfoldOrDown(state: TreeNavState, rows: TreeRow[]): TreeNavState {
  if (rows.length === 0) return state;
  const i = indexOf(rows, state.selectedId);
  const row = rows[i]!;
  if (row.folded) {
    const folded = new Set(state.folded);
    folded.delete(row.id);
    return { folded, selectedId: row.id };
  }
  for (let j = i + 1; j < rows.length; j++) {
    if (rows[j]!.hasChildren) return { folded: state.folded, selectedId: rows[j]!.id };
  }
  return { folded: state.folded, selectedId: rows[rows.length - 1]!.id };
}

export function moveSelection(state: TreeNavState, rows: TreeRow[], dir: 1 | -1): TreeNavState {
  if (rows.length === 0) return { folded: state.folded, selectedId: undefined };
  const i = indexOf(rows, state.selectedId);
  const next = Math.max(0, Math.min(rows.length - 1, i + dir));
  return { folded: state.folded, selectedId: rows[next]!.id };
}
