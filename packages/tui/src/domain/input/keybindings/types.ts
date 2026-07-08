import type { KeyId } from "../key-chord.ts";

export interface Keybindings {
  "tui.editor.cursorUp": true; "tui.editor.cursorDown": true;
  "tui.editor.cursorLeft": true; "tui.editor.cursorRight": true;
  "tui.editor.cursorWordLeft": true; "tui.editor.cursorWordRight": true;
  "tui.editor.cursorLineStart": true; "tui.editor.cursorLineEnd": true;
  "tui.editor.jumpForward": true; "tui.editor.jumpBackward": true;
  "tui.editor.pageUp": true; "tui.editor.pageDown": true;
  "tui.editor.deleteCharBackward": true; "tui.editor.deleteCharForward": true;
  "tui.editor.deleteWordBackward": true; "tui.editor.deleteWordForward": true;
  "tui.editor.deleteToLineStart": true; "tui.editor.deleteToLineEnd": true;
  "tui.editor.yank": true; "tui.editor.yankPop": true; "tui.editor.undo": true;
  "tui.input.newLine": true; "tui.input.submit": true; "tui.input.tab": true; "tui.input.copy": true;
  "tui.select.up": true; "tui.select.down": true; "tui.select.pageUp": true;
  "tui.select.pageDown": true; "tui.select.confirm": true; "tui.select.cancel": true;
}
export type Keybinding = keyof Keybindings;
export interface KeybindingDefinition { defaultKeys: KeyId | KeyId[]; description?: string }
export type KeybindingDefinitions = Record<string, KeybindingDefinition>;
export type KeybindingsConfig = Record<string, KeyId | KeyId[] | undefined>;
export interface KeybindingConflict { key: KeyId; keybindings: string[] }
