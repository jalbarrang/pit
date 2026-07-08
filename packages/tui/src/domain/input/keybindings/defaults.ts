import { EDITOR_KEYBINDINGS } from "./defaults-editor.ts";
import { UI_KEYBINDINGS } from "./defaults-ui.ts";
import type { KeybindingDefinitions } from "./types.ts";

export const TUI_KEYBINDINGS = {
  ...EDITOR_KEYBINDINGS,
  ...UI_KEYBINDINGS,
} as const satisfies KeybindingDefinitions;
