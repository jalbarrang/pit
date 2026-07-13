import type { SelectListTheme, SettingsListTheme, TUI } from "@pit/tui";
import type { PitSettings } from "../../domain/chrome/index.ts";
import { createTheme, type PitTheme } from "../../domain/theming/index.ts";

export const overlayWidth = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);

export const currentTheme = (host: { settings(): PitSettings }): PitTheme => createTheme(host.settings().theme);

// The Night Console: overlay edges in connector (Tint Ladder Rule), selection is the selectedBg tint, interactive elements in violet.
export const selectListTheme = (theme: PitTheme): SelectListTheme => ({
  text: theme.fg("text"),
  selectedPrefix: { fg: theme.color("interactive"), bg: theme.color("selectedBg") },
  selectedText: { fg: theme.color("text"), bg: theme.color("selectedBg") },
  description: theme.fg("muted"),
  scrollInfo: theme.fg("dim"),
  noMatch: theme.fg("muted"),
});

export const settingsListTheme = (theme: PitTheme): SettingsListTheme => ({
  label: theme.fg("text"),
  value: theme.fg("interactive"),
  description: theme.fg("muted"),
  hint: theme.fg("dim"),
  selected: { fg: theme.color("interactive"), bg: theme.color("selectedBg") },
});
