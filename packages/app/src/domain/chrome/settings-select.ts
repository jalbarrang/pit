import type { SettingItem } from "@pit/tui";
import type { ThemeName } from "../theming/index.ts";

export interface PitSettings {
  theme: ThemeName;
  showImages: boolean;
  autoResizeImages: boolean;
  blockImages: boolean;
  editorPaddingX: number;
  autocompleteMaxVisible: number;
}

export type PitSettingKey = keyof PitSettings;

export const defaultPitSettings = (): PitSettings => ({
  theme: "dark",
  showImages: false,
  autoResizeImages: true,
  blockImages: false,
  editorPaddingX: 0,
  autocompleteMaxVisible: 5,
});

export const settingsItems = (settings: PitSettings): SettingItem[] => [
  { id: "theme", label: "Theme", description: "Color theme for pit", currentValue: settings.theme, values: ["dark", "light"] },
  boolItem("showImages", "Show images", "Render images inline when image chrome lands", settings.showImages),
  boolItem("autoResizeImages", "Auto-resize images", "Resize large images before model upload", settings.autoResizeImages),
  boolItem("blockImages", "Block images", "Prevent images from being sent to providers", settings.blockImages),
  { id: "editorPaddingX", label: "Editor padding", description: "Horizontal editor padding", currentValue: String(settings.editorPaddingX), values: ["0", "1", "2", "3"] },
  { id: "autocompleteMaxVisible", label: "Autocomplete max items", description: "Max visible autocomplete rows", currentValue: String(settings.autocompleteMaxVisible), values: ["3", "5", "7", "10", "15", "20"] },
];

const boolItem = (id: string, label: string, description: string, value: boolean): SettingItem =>
  ({ id, label, description, currentValue: value ? "true" : "false", values: ["true", "false"] });
