import { visualLines } from "../../domain/editing/index.ts";
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
  return { lines: rows.slice(offset, offset + maxHeight), cursorRow: cursorRow - offset, cursorCol: cursor.col - vl.start, offset };
}

export function withCursor(lines: string[], row: number, col: number, focused: boolean): string[] {
  if (!focused) return lines;
  return lines.map((line, i) => i !== row ? line : line.slice(0, col) + "\x1b[7m" + (line[col] ?? " ") + "\x1b[0m" + line.slice(col + 1));
}
