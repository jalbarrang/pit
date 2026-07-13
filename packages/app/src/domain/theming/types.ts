export type ThemeName = "dark" | "light" | "tokyo-night";
export type ColorValue = string | number;
export type ThemeColors = Record<string, ColorValue>;

export interface ThemeJson {
  name: ThemeName;
  vars?: Record<string, ColorValue>;
  colors: ThemeColors;
  export?: ThemeColors;
}

export interface PitStyleLike {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
}

export interface PitTheme {
  name: ThemeName;
  color(token: string): string;
  fg(token: string): PitStyleLike;
  bg(token: string): PitStyleLike;
}
