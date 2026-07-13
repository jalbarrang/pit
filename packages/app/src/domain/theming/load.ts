import dark from "./themes/dark.json" with { type: "json" };
import light from "./themes/light.json" with { type: "json" };
import tokyoNight from "./themes/tokyo-night.json" with { type: "json" };
import type { ThemeJson, ThemeName } from "./types.ts";

const themes = { dark, light, "tokyo-night": tokyoNight };

export const loadThemeJson = (name: ThemeName): ThemeJson => themes[name] as ThemeJson;
