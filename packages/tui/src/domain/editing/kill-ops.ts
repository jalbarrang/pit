import { findWordBackward, findWordForward } from "../input/index.ts";
import { insertText } from "./edit-ops.ts";
import type { EditorState } from "./types.ts";

export function killStart(state: EditorState): string {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col > 0) {
    const text = line.slice(0, state.cursor.col);
    state.lines[state.cursor.line] = line.slice(state.cursor.col);
    state.cursor.col = 0;
    return text;
  }
  if (state.cursor.line === 0) return "";
  const current = state.lines[state.cursor.line] ?? "";
  const prev = state.lines[state.cursor.line - 1] ?? "";
  state.lines[state.cursor.line - 1] = prev + current;
  state.lines.splice(state.cursor.line, 1);
  state.cursor.line--;
  state.cursor.col = prev.length;
  return "\n";
}

export function killEnd(state: EditorState): string {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col < line.length) {
    const text = line.slice(state.cursor.col);
    state.lines[state.cursor.line] = line.slice(0, state.cursor.col);
    return text;
  }
  if (state.cursor.line >= state.lines.length - 1) return "";
  state.lines[state.cursor.line] = line + (state.lines[state.cursor.line + 1] ?? "");
  state.lines.splice(state.cursor.line + 1, 1);
  return "\n";
}

export function killWordBack(state: EditorState): string {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col === 0) return killStart(state);
  const start = findWordBackward(line, state.cursor.col);
  const text = line.slice(start, state.cursor.col);
  state.lines[state.cursor.line] = line.slice(0, start) + line.slice(state.cursor.col);
  state.cursor.col = start;
  return text;
}

export function killWordForward(state: EditorState): string {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col >= line.length) return killEnd(state);
  const end = findWordForward(line, state.cursor.col);
  const text = line.slice(state.cursor.col, end);
  state.lines[state.cursor.line] = line.slice(0, state.cursor.col) + line.slice(end);
  return text;
}

export function transpose(state: EditorState): boolean {
  const line = state.lines[state.cursor.line] ?? "";
  const col = state.cursor.col === line.length ? state.cursor.col - 1 : state.cursor.col;
  if (col <= 0 || line.length < 2) return false;
  state.lines[state.cursor.line] = line.slice(0, col - 1) + line[col] + line[col - 1] + line.slice(col + 1);
  state.cursor.col = Math.min(line.length, col + 1);
  return true;
}

export function yankText(state: EditorState, text: string): void { insertText(state, text); }
