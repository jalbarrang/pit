import { getKeybindings } from "./keybindings/index.ts";
import { decodeKittyPrintable } from "./keys/printable.ts";
import { sliceByCells, visibleWidth } from "../styling/index.ts";

export type TextFieldAction = "changed" | "submit" | "escape" | "none";
export interface FieldWindow { prompt: string; before: string; at: string; after: string; focused: boolean }
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const parts = (text: string): string[] => [...segmenter.segment(text)].map((part) => part.segment);
const prevIndex = (text: string, cursor: number): number => {
  const before = parts(text.slice(0, cursor));
  return Math.max(0, cursor - (before.at(-1)?.length ?? 1));
};
const nextIndex = (text: string, cursor: number): number => {
  const after = parts(text.slice(cursor));
  return Math.min(text.length, cursor + (after[0]?.length ?? 1));
};
const isPrintable = (data: string): boolean => ![...data].some((ch) => {
  const code = ch.charCodeAt(0);
  return code < 32 || code === 0x7f || (code >= 0x80 && code <= 0x9f);
});

export class TextFieldModel {
  value = "";
  cursor = 0;

  setValue(value: string): void {
    this.value = value.replace(/[\r\n]/g, "");
    this.cursor = Math.min(this.cursor, this.value.length);
  }

  handleInput(data: string): TextFieldAction {
    const kb = getKeybindings();
    if (kb.matches(data, "tui.select.cancel")) return "escape";
    if (kb.matches(data, "tui.input.submit") || data === "\n") return "submit";
    if (kb.matches(data, "tui.editor.cursorLineStart")) return this.moveTo(0);
    if (kb.matches(data, "tui.editor.cursorLineEnd")) return this.moveTo(this.value.length);
    if (kb.matches(data, "tui.editor.cursorLeft")) return this.moveTo(prevIndex(this.value, this.cursor));
    if (kb.matches(data, "tui.editor.cursorRight")) return this.moveTo(nextIndex(this.value, this.cursor));
    if (kb.matches(data, "tui.editor.deleteCharBackward")) return this.backspace();
    if (kb.matches(data, "tui.editor.deleteCharForward")) return this.deleteForward();
    const kitty = decodeKittyPrintable(data);
    if (kitty !== undefined) return this.insert(kitty);
    return isPrintable(data) ? this.insert(data) : "none";
  }

  window(width: number, focused: boolean, prompt = "> "): FieldWindow {
    const available = Math.max(0, width - prompt.length);
    const cursorCol = visibleWidth(this.value.slice(0, this.cursor));
    const start = Math.max(0, Math.min(cursorCol, visibleWidth(this.value)) - Math.max(1, available - 1));
    const text = sliceByCells(this.value, start, Math.max(1, available));
    const localCursor = sliceByCells(this.value, start, Math.max(0, cursorCol - start)).length;
    const before = text.slice(0, localCursor);
    const at = parts(text.slice(localCursor))[0] ?? " ";
    const after = text.slice(localCursor + at.length);
    return { prompt, before, at, after, focused };
  }

  private moveTo(cursor: number): TextFieldAction { this.cursor = cursor; return "changed"; }
  private insert(text: string): TextFieldAction {
    this.value = this.value.slice(0, this.cursor) + text + this.value.slice(this.cursor);
    this.cursor += text.length;
    return "changed";
  }
  private backspace(): TextFieldAction {
    if (this.cursor === 0) return "none";
    const next = prevIndex(this.value, this.cursor);
    this.value = this.value.slice(0, next) + this.value.slice(this.cursor);
    this.cursor = next;
    return "changed";
  }
  private deleteForward(): TextFieldAction {
    if (this.cursor >= this.value.length) return "none";
    this.value = this.value.slice(0, this.cursor) + this.value.slice(nextIndex(this.value, this.cursor));
    return "changed";
  }
}
