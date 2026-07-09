import type { SelectItem } from "@pit/tui";
import type { ThemeName } from "../theming/index.ts";

export const AVAILABLE_THEMES: ThemeName[] = ["dark", "light"];

export const themeSelectItems = (current: ThemeName): { items: SelectItem[]; initialIndex: number } => {
  const items = AVAILABLE_THEMES.map((name) => ({ value: name, label: name, description: name === current ? "(current)" : undefined }));
  return { items, initialIndex: Math.max(0, AVAILABLE_THEMES.indexOf(current)) };
};

export const isThemeName = (value: string): value is ThemeName =>
  (AVAILABLE_THEMES as string[]).includes(value);
