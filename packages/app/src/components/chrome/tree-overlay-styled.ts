import { StyledText, type TextChunk } from "@opentui/core";
import { joinStyledLines, styleChunk, visibleWidth } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import type { TreeFilter, TreeRow } from "../../domain/tree/index.ts";
import { windowRows } from "./overlay-window.ts";
import { foldMarker, formatTimestamp, TREE_OVERLAY_HINT, type FormatRowOptions } from "./tree-overlay-rows.ts";

/** Styled variant of formatTreeRow: same text, with Night Console roles per segment; the selected row carries the full-width selectedBg tint. */
function treeRowChunks(row: TreeRow, options: FormatRowOptions, theme: PitTheme, width: number): TextChunk[] {
  const isLeaf = options.leafId !== undefined && row.id === options.leafId;
  const ts = options.showTimestamps && row.timestamp !== undefined ? ` (${formatTimestamp(row.timestamp)})` : "";
  const rowBg = options.highlighted ? theme.color("selectedBg") : undefined;
  const style = (token: string) => (rowBg !== undefined ? { fg: theme.color(token), bg: rowBg } : theme.fg(token));
  const chunks = [
    styleChunk(options.highlighted ? "→ " : "  ", style("interactive")),
    ...(isLeaf ? [styleChunk("➤ ", style("brand"))] : []),
    styleChunk(`${" ".repeat(2 * row.depth)}${foldMarker(row)} `, style(row.hasChildren ? "interactive" : "connector")),
    ...(row.label !== undefined ? [styleChunk(`[${row.label}] `, style("warning"))] : []),
    styleChunk(row.text, style(row.kind === "tool" ? "muted" : "text")),
    ...(ts ? [styleChunk(ts, style("dim"))] : []),
  ];
  if (rowBg !== undefined) {
    const used = chunks.reduce((sum, chunk) => sum + visibleWidth(chunk.text), 0);
    if (used < width) chunks.push(styleChunk(" ".repeat(width - used), { bg: rowBg }));
  }
  return chunks;
}

export function formatTreeOverlayStyled(
  rows: TreeRow[],
  selectedId: string | undefined,
  filter: TreeFilter,
  query: string,
  leafId: string | undefined,
  showTimestamps: boolean,
  maxVisible: number,
  theme: PitTheme,
  width: number,
): StyledText {
  const hi = Math.max(0, rows.findIndex((r) => r.id === selectedId));
  const win = windowRows(rows.length, hi, maxVisible);
  const lines: TextChunk[][] = [[
    styleChunk(`Session tree · filter:${filter}`, theme.fg("muted")),
    ...(query.length > 0 ? [styleChunk(` ${query}`, theme.fg("text"))] : []),
  ]];
  if (win.above > 0) lines.push([styleChunk(`↑ ${win.above} more`, theme.fg("dim"))]);
  for (const row of rows.slice(win.start, win.end)) {
    lines.push(treeRowChunks(row, { highlighted: row.id === selectedId, ...(leafId !== undefined ? { leafId } : {}), showTimestamps }, theme, width));
  }
  if (win.below > 0) lines.push([styleChunk(`↓ ${win.below} more`, theme.fg("dim"))]);
  lines.push([styleChunk(TREE_OVERLAY_HINT, theme.fg("dim"))]);
  return joinStyledLines(lines);
}
