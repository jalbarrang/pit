import type { EditorTheme } from "@pit/tui";
import type { PitTheme } from "./types.ts";

export const getEditorTheme = (theme: PitTheme): EditorTheme => ({
  borderColor: (text) => text,
  textColor: theme.color("text"),
  focusedTextColor: theme.color("text"),
  selectList: {
    selectedText: { fg: theme.color("text"), bg: theme.color("selectedBg") },
    description: { fg: theme.color("muted") },
  },
});
