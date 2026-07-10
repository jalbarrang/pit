import { decodePrintableKey, getKeybindings, matchesKey } from "../../domain/input/index.ts";

export type EditorKey =
  | "undo" | "redo" | "backspace" | "delete" | "left" | "right" | "up" | "down" | "home" | "end"
  | "wordLeft" | "wordRight" | "newline" | "submit" | "tab" | "escape" | "killStart" | "killEnd"
  | "killWordBack" | "killWordForward" | "yank" | "yankPop" | "transpose";

export function editorKey(data: string): EditorKey | null {
  const kb = getKeybindings();
  if (kb.matches(data, "tui.editor.undo")) return "undo";
  if (matchesKey(data, "ctrl+shift+z")) return "redo";
  if (kb.matches(data, "tui.editor.deleteCharBackward") || matchesKey(data, "shift+backspace")) return "backspace";
  if (kb.matches(data, "tui.editor.deleteCharForward") || matchesKey(data, "shift+delete")) return "delete";
  if (kb.matches(data, "tui.editor.cursorLeft")) return "left";
  if (kb.matches(data, "tui.editor.cursorRight")) return "right";
  if (kb.matches(data, "tui.editor.cursorUp")) return "up";
  if (kb.matches(data, "tui.editor.cursorDown")) return "down";
  if (kb.matches(data, "tui.editor.cursorLineStart")) return "home";
  if (kb.matches(data, "tui.editor.cursorLineEnd")) return "end";
  if (kb.matches(data, "tui.editor.cursorWordLeft")) return "wordLeft";
  if (kb.matches(data, "tui.editor.cursorWordRight")) return "wordRight";
  if (kb.matches(data, "tui.editor.deleteToLineStart")) return "killStart";
  if (kb.matches(data, "tui.editor.deleteToLineEnd")) return "killEnd";
  if (kb.matches(data, "tui.editor.deleteWordBackward")) return "killWordBack";
  if (kb.matches(data, "tui.editor.deleteWordForward")) return "killWordForward";
  if (kb.matches(data, "tui.editor.yank")) return "yank";
  if (kb.matches(data, "tui.editor.yankPop")) return "yankPop";
  if (kb.matches(data, "tui.input.newLine") || matchesKey(data, "shift+enter") || matchesKey(data, "alt+enter") || data === "\x1b[13;2~" || data === "\x1b\r") return "newline";
  if (kb.matches(data, "tui.input.submit")) return "submit";
  if (kb.matches(data, "tui.input.tab")) return "tab";
  if (kb.matches(data, "tui.select.cancel")) return "escape";
  return null;
}

export const printableInput = (data: string): string | null => decodePrintableKey(data) ?? (data.length === 1 && data.charCodeAt(0) >= 32 ? data : null);
