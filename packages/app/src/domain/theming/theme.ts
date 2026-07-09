import { resolveThemeColors } from "./colors.ts";
import { loadThemeJson } from "./load.ts";
import type { PitStyleLike, PitTheme, ThemeName } from "./types.ts";

export class ResolvedTheme implements PitTheme {
  readonly name: ThemeName;
  private readonly colors: Record<string, string>;

  constructor(name: ThemeName) {
    this.name = name;
    this.colors = resolveThemeColors(loadThemeJson(name));
  }

  color(token: string): string {
    const color = this.colors[token];
    if (!color) throw new Error(`Unknown theme token: ${token}`);
    return color;
  }

  fg(token: string): PitStyleLike {
    return { fg: this.color(token) };
  }

  bg(token: string): PitStyleLike {
    return { bg: this.color(token) };
  }
}

export const createTheme = (name: ThemeName = "dark"): PitTheme => new ResolvedTheme(name);
