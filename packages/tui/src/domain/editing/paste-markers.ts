import { cursorFromOffset, linesFromText, offsetFromCursor, textFromState } from "./text.ts";
import type { EditorCursor, EditorState } from "./types.ts";

export const LARGE_PASTE_LINE_THRESHOLD = 10;
export const LARGE_PASTE_CHAR_THRESHOLD = 1000;
const MARKER = /\[paste #(\d+)( (\+\d+ lines|\d+ chars))?\]/g;

export type PasteEntry = [number, string];
export interface PasteRegistry { pastes: PasteEntry[]; pasteCounter: number }

export const largePasteMarker = (id: number, text: string): string => {
  const lines = text.split("\n").length;
  return lines > LARGE_PASTE_LINE_THRESHOLD ? `[paste #${id} +${lines} lines]` : `[paste #${id} ${text.length} chars]`;
};

export const shouldCollapsePaste = (text: string): boolean =>
  text.split("\n").length > LARGE_PASTE_LINE_THRESHOLD || text.length > LARGE_PASTE_CHAR_THRESHOLD;

export function expandedText(text: string, pastes: PasteEntry[]): string {
  let out = text;
  for (const [id, value] of pastes) out = out.replace(new RegExp(`\\[paste #${id}( (\\+\\d+ lines|\\d+ chars))?\\]`, "g"), () => value);
  return out;
}

export function insertPaste(registry: PasteRegistry, text: string): string {
  if (!shouldCollapsePaste(text)) return text;
  const id = ++registry.pasteCounter;
  registry.pastes.push([id, text]);
  return largePasteMarker(id, text);
}

export function expandedState(state: EditorState, pastes: PasteEntry[]): EditorState {
  const oldText = textFromState(state);
  const oldOffset = offsetFromCursor(state);
  const { text, offset } = expandAtOffset(oldText, oldOffset, pastes);
  return { lines: linesFromText(text), cursor: cursorFromOffset({ lines: linesFromText(text), cursor: { line: 0, col: 0 } }, offset) };
}

export function touchesMarker(state: EditorState, pastes: PasteEntry[], kind: "insert" | "backspace" | "delete"): boolean {
  const text = textFromState(state);
  const offset = offsetFromCursor(state);
  for (const span of markerSpans(text, pastes)) {
    if (kind === "insert" && offset > span.start && offset < span.end) return true;
    if (kind === "backspace" && offset > span.start && offset <= span.end) return true;
    if (kind === "delete" && offset >= span.start && offset < span.end) return true;
  }
  return false;
}

function markerSpans(text: string, pastes: PasteEntry[]): Array<{ start: number; end: number; value: string }> {
  const valid = new Map(pastes);
  return [...text.matchAll(MARKER)]
    .map((match) => ({ match, value: valid.get(Number(match[1])) }))
    .filter((item): item is { match: RegExpExecArray; value: string } => item.value !== undefined)
    .map(({ match, value }) => ({ start: match.index, end: match.index + match[0].length, value }));
}

function expandAtOffset(text: string, offset: number, pastes: PasteEntry[]): { text: string; offset: number } {
  let out = "";
  let cursor = offset;
  let last = 0;
  for (const span of markerSpans(text, pastes)) {
    out += text.slice(last, span.start) + span.value;
    if (offset > span.start && offset < span.end) cursor = out.length;
    else if (offset >= span.end) cursor += span.value.length - (span.end - span.start);
    else if (offset === span.start) cursor = out.length - span.value.length;
    last = span.end;
  }
  return { text: out + text.slice(last), offset: cursor };
}
