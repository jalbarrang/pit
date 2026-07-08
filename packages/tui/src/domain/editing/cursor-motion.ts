import { findWordBackward, findWordForward } from "../input/index.ts";
import { nextGrapheme, previousGrapheme } from "./text.ts";
import { visualIndex, visualLines } from "./line-wrap.ts";
import type { EditorState } from "./types.ts";

export function moveHorizontal(state: EditorState, delta: -1 | 1): void {
  const line = state.lines[state.cursor.line] ?? "";
  if (delta > 0 && state.cursor.col < line.length) state.cursor.col = nextGrapheme(line, state.cursor.col);
  else if (delta > 0 && state.cursor.line < state.lines.length - 1) { state.cursor.line++; state.cursor.col = 0; }
  else if (delta < 0 && state.cursor.col > 0) state.cursor.col = previousGrapheme(line, state.cursor.col);
  else if (delta < 0 && state.cursor.line > 0) { state.cursor.line--; state.cursor.col = state.lines[state.cursor.line]!.length; }
}

export function moveVertical(state: EditorState, delta: -1 | 1, width: number): void {
  const lines = visualLines(state, width);
  const current = visualIndex(lines, state.cursor.line, state.cursor.col);
  const target = lines[current + delta];
  const source = lines[current];
  if (!target || !source) return;
  const col = Math.min(state.cursor.col - source.start, target.length);
  state.cursor.line = target.line;
  state.cursor.col = target.start + col;
}

export const moveLineStart = (state: EditorState): void => { state.cursor.col = 0; };
export const moveLineEnd = (state: EditorState): void => { state.cursor.col = state.lines[state.cursor.line]?.length ?? 0; };
export function moveWord(state: EditorState, direction: -1 | 1): void {
  const line = state.lines[state.cursor.line] ?? "";
  if (direction < 0 && state.cursor.col === 0 && state.cursor.line > 0) { state.cursor.line--; moveLineEnd(state); return; }
  if (direction > 0 && state.cursor.col >= line.length && state.cursor.line < state.lines.length - 1) { state.cursor.line++; state.cursor.col = 0; return; }
  state.cursor.col = direction < 0 ? findWordBackward(line, state.cursor.col) : findWordForward(line, state.cursor.col);
}
