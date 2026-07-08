import type { EditorCursor, EditorState } from "./types.ts";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
export const normalizeText = (text: string): string => text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\t/g, "    ");
export const linesFromText = (text: string): string[] => normalizeText(text).split("\n");
export const textFromState = (state: EditorState): string => state.lines.join("\n");
export const cloneState = (state: EditorState): EditorState => ({ lines: [...state.lines], cursor: { ...state.cursor } });
export const clampCursor = (state: EditorState): void => {
  state.cursor.line = Math.max(0, Math.min(state.cursor.line, state.lines.length - 1));
  state.cursor.col = Math.max(0, Math.min(state.cursor.col, state.lines[state.cursor.line]?.length ?? 0));
};
export const previousGrapheme = (text: string, col: number): number => {
  const before = [...graphemes.segment(text.slice(0, col))].at(-1);
  return before ? col - before.segment.length : Math.max(0, col - 1);
};
export const nextGrapheme = (text: string, col: number): number => {
  const next = [...graphemes.segment(text.slice(col))][0];
  return next ? col + next.segment.length : Math.min(text.length, col + 1);
};
export const offsetFromCursor = (state: EditorState): number => state.lines.slice(0, state.cursor.line).reduce((n, line) => n + line.length + 1, 0) + state.cursor.col;
export const cursorFromOffset = (state: EditorState, offset: number): EditorCursor => {
  let rest = Math.max(0, offset);
  for (let line = 0; line < state.lines.length; line++) {
    const len = state.lines[line]!.length;
    if (rest <= len) return { line, col: rest };
    rest -= len + 1;
  }
  const line = state.lines.length - 1;
  return { line, col: state.lines[line]?.length ?? 0 };
};
