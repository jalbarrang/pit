import { readFileSync } from "node:fs";
import type { ThemeJson, ThemeName } from "./types.ts";

const urlFor = (name: ThemeName): URL => new URL(`./themes/${name}.json`, import.meta.url);

export const loadThemeJson = (name: ThemeName): ThemeJson =>
  JSON.parse(readFileSync(urlFor(name), "utf8")) as ThemeJson;
