import type { PitStyle } from "./component-style.ts";

export interface SelectItem { value: string; label: string; description?: string }
export interface SelectListTheme {
  text?: PitStyle;
  selectedPrefix?: PitStyle;
  selectedText?: PitStyle;
  description?: PitStyle;
  scrollInfo?: PitStyle;
  noMatch?: PitStyle;
}
export interface SelectListTruncatePrimaryContext {
  text: string;
  maxWidth: number;
  columnWidth: number;
  item: SelectItem;
  isSelected: boolean;
}
export interface SelectListLayoutOptions {
  minPrimaryColumnWidth?: number;
  maxPrimaryColumnWidth?: number;
  truncatePrimary?: (context: SelectListTruncatePrimaryContext) => string;
}
