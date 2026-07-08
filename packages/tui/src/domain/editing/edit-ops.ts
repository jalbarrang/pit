import { nextGrapheme, previousGrapheme } from "./text.ts";
import type { EditorState } from "./types.ts";

export function insertText(state: EditorState, text: string): void {
  if (!text) return;
  const parts = text.split("\n");
  const line = state.lines[state.cursor.line] ?? "";
  const before = line.slice(0, state.cursor.col);
  const after = line.slice(state.cursor.col);
  if (parts.length === 1) {
    state.lines[state.cursor.line] = before + text + after;
    state.cursor.col += text.length;
    return;
  }
  state.lines.splice(state.cursor.line, 1, before + parts[0], ...parts.slice(1, -1), parts.at(-1)! + after);
  state.cursor.line += parts.length - 1;
  state.cursor.col = parts.at(-1)!.length;
}

export function backspace(state: EditorState): boolean {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col > 0) {
    const start = previousGrapheme(line, state.cursor.col);
    state.lines[state.cursor.line] = line.slice(0, start) + line.slice(state.cursor.col);
    state.cursor.col = start;
    return true;
  }
  if (state.cursor.line === 0) return false;
  const prev = state.lines[state.cursor.line - 1] ?? "";
  state.lines[state.cursor.line - 1] = prev + line;
  state.lines.splice(state.cursor.line, 1);
  state.cursor.line--;
  state.cursor.col = prev.length;
  return true;
}

export function deleteForward(state: EditorState): boolean {
  const line = state.lines[state.cursor.line] ?? "";
  if (state.cursor.col < line.length) {
    const end = nextGrapheme(line, state.cursor.col);
    state.lines[state.cursor.line] = line.slice(0, state.cursor.col) + line.slice(end);
    return true;
  }
  if (state.cursor.line >= state.lines.length - 1) return false;
  state.lines[state.cursor.line] = line + (state.lines[state.cursor.line + 1] ?? "");
  state.lines.splice(state.cursor.line + 1, 1);
  return true;
}
