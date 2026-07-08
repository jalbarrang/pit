import type { Component } from "./component.ts";
import type { PitStyle } from "./component-style.ts";

export interface SettingItem {
  id: string;
  label: string;
  description?: string;
  currentValue: string;
  values?: string[];
  submenu?: (currentValue: string, done: (selectedValue?: string) => void) => Component;
}
export interface SettingsListTheme {
  label?: PitStyle;
  value?: PitStyle;
  description?: PitStyle;
  cursor?: string;
  hint?: PitStyle;
}
export interface SettingsListOptions { enableSearch?: boolean }
export type SettingsChange = (id: string, newValue: string) => void;
