import type { EditorTheme } from "./types.ts";

export const defaultEditorTheme: EditorTheme = {
  borderColor: (text) => text,
  selectList: {},
  textColor: "#ffffff",
  focusedTextColor: "#ffffff",
};

export const border = (theme: EditorTheme, text: string): string => (theme.borderColor ?? ((value) => value))(text);
