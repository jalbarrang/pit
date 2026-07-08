import type { EditorModel } from "../../domain/editing/index.ts";
import type { EditorKey } from "./keymap.ts";

export function applyEditorCommand(model: EditorModel, key: EditorKey): "submit" | "autocomplete" | "handled" | "ignored" {
  if (key === "submit") return "submit";
  if (key === "tab" || key === "escape") return "autocomplete";
  if (key === "newline") model.newline();
  else if (key === "backspace") model.backspace();
  else if (key === "delete") model.deleteForward();
  else if (key === "left") model.left();
  else if (key === "right") model.right();
  else if (key === "up") model.up();
  else if (key === "down") model.down();
  else if (key === "home") model.start();
  else if (key === "end") model.end();
  else if (key === "wordLeft") model.wordLeft();
  else if (key === "wordRight") model.wordRight();
  else if (key === "killStart") model.killStart();
  else if (key === "killEnd") model.killEnd();
  else if (key === "killWordBack") model.killWordBack();
  else if (key === "killWordForward") model.killWordForward();
  else if (key === "yank") model.yank();
  else if (key === "yankPop") model.yankPop();
  else if (key === "transpose") model.transpose();
  else if (key === "undo") model.undo();
  else if (key === "redo") model.redo();
  else return "ignored";
  return "handled";
}
