import type { TreeRow } from "./flatten.ts";

/** Case-insensitive substring match on text + label. Empty query returns rows unchanged. */
export function filterRows(rows: TreeRow[], query: string): TreeRow[] {
  if (query.length === 0) return rows;
  const q = query.toLowerCase();
  return rows.filter((row) => {
    if (row.text.toLowerCase().includes(q)) return true;
    return row.label !== undefined && row.label.toLowerCase().includes(q);
  });
}
