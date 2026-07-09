import { visualLines } from "../../domain/editing/index.ts";
import { cellsBetween } from "../../domain/editing/wrap-measure.ts";
import type { EditorCursor, EditorState } from "../../domain/editing/index.ts";

export interface Viewport { lines: string[]; cursorRow: number; cursorCol: number; offset: number }

export function renderViewport(state: EditorState, width: number, maxHeight: number, cursor: EditorCursor): Viewport {
  const visuals = visualLines(state, width);
  const rows = visuals.map((vl) => (state.lines[vl.line] ?? "").slice(vl.start, vl.start + vl.length));
  let cursorRow = visuals.findIndex((vl, index) => {
    const next = visuals[index + 1];
    const last = !next || next.line !== vl.line;
    const rel = cursor.col - vl.start;
    return vl.line === cursor.line && rel >= 0 && (rel < vl.length || (last && rel <= vl.length));
  });
  if (cursorRow < 0) cursorRow = 0;
  const vl = visuals[cursorRow] ?? { start: 0 };
  const offset = Math.max(0, Math.min(cursorRow, rows.length - maxHeight));
  const cursorLine = state.lines[cursor.line] ?? "";
  return { lines: rows.slice(offset, offset + maxHeight), cursorRow: cursorRow - offset, cursorCol: cellsBetween(cursorLine, vl.start, cursor.col), offset };
}

export interface CursorSegments { before: string; at: string; after: string }

export function splitAtCursor(line: string, col: number): CursorSegments {
  return { before: line.slice(0, col), at: line[col] ?? " ", after: line.slice(col + 1) };
}
