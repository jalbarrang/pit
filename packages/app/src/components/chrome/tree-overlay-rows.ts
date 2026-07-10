import type { TreeFilter, TreeRow } from "../../domain/tree/index.ts";

export interface FormatRowOptions {
  highlighted: boolean;
  leafId?: string;
  showTimestamps: boolean;
}

/** HH:MM from epoch ms (local). */
export function formatTimestamp(timestamp: number): string {
  const d = new Date(timestamp);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function foldMarker(row: TreeRow): string {
  if (!row.hasChildren) return "·";
  return row.folded ? "▸" : "▾";
}

export function formatTreeRow(row: TreeRow, options: FormatRowOptions): string {
  const hi = options.highlighted ? "→ " : "  ";
  const leaf = options.leafId !== undefined && row.id === options.leafId ? "➤ " : "";
  const indent = " ".repeat(2 * row.depth);
  const label = row.label !== undefined ? `[${row.label}] ` : "";
  const ts =
    options.showTimestamps && row.timestamp !== undefined
      ? ` (${formatTimestamp(row.timestamp)})`
      : "";
  return `${hi}${leaf}${indent}${foldMarker(row)} ${label}${row.text}${ts}`;
}

export function formatTreeOverlayLines(
  rows: TreeRow[],
  selectedId: string | undefined,
  filter: TreeFilter,
  query: string,
  leafId: string | undefined,
  showTimestamps: boolean,
): string[] {
  return [
    `filter:${filter}${query.length > 0 ? ` ${query}` : ""}`,
    ...rows.map((row) =>
      formatTreeRow(row, {
        highlighted: row.id === selectedId,
        ...(leafId !== undefined ? { leafId } : {}),
        showTimestamps,
      }),
    ),
  ];
}
