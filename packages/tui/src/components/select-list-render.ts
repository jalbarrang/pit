import type { StyledText } from "@opentui/core";
import type { ListSelection } from "../domain/input/index.ts";
import { truncateToWidth, visibleWidth } from "../domain/styling/index.ts";
import { selectListStyled, type SelectStyledRow } from "./list-styled.ts";
import type { SelectItem, SelectListLayoutOptions, SelectListTheme } from "./select-list-types.ts";

const DEFAULT_PRIMARY_COLUMN_WIDTH = 32;
const PRIMARY_COLUMN_GAP = 2;
const normalize = (text = ""): string => text.replace(/[\r\n]+/g, " ").trim();
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

export interface SelectListView {
  selection: ListSelection<SelectItem>;
  maxVisible: number;
  theme: SelectListTheme;
  layout: SelectListLayoutOptions;
}

const primaryColumnWidth = (view: SelectListView): number => {
  const min = view.layout.minPrimaryColumnWidth ?? view.layout.maxPrimaryColumnWidth ?? DEFAULT_PRIMARY_COLUMN_WIDTH;
  const max = view.layout.maxPrimaryColumnWidth ?? view.layout.minPrimaryColumnWidth ?? DEFAULT_PRIMARY_COLUMN_WIDTH;
  const widest = Math.max(1, ...view.selection.filteredItems.map((item) => visibleWidth(item.label || item.value) + PRIMARY_COLUMN_GAP));
  return clamp(widest, Math.min(min, max), Math.max(min, max));
};

const truncatePrimary = (view: SelectListView, item: SelectItem, selected: boolean, maxWidth: number, columnWidth: number): string => {
  const text = item.label || item.value;
  const custom = view.layout.truncatePrimary?.({ text, maxWidth, columnWidth, item, isSelected: selected }) ?? text;
  return truncateToWidth(custom, Math.max(1, maxWidth), "…");
};

const primaryLabel = (view: SelectListView, item: SelectItem, selected: boolean, width: number): string =>
  truncatePrimary(view, item, selected, Math.min(primaryColumnWidth(view), width - 4), primaryColumnWidth(view));

const renderItem = (view: SelectListView, item: SelectItem, selected: boolean, width: number): string => {
  const prefix = selected ? "→ " : "  ";
  const label = primaryLabel(view, item, selected, width);
  const desc = normalize(item.description);
  if (!desc || width <= 40) return truncateToWidth(`${prefix}${label}`, width, "", true);
  const spacing = " ".repeat(Math.max(1, primaryColumnWidth(view) - visibleWidth(label)));
  return truncateToWidth(`${prefix}${label}${spacing}${desc}`, width, "", true);
};

export const renderSelectLines = (view: SelectListView, width: number): string[] => {
  if (view.selection.filteredItems.length === 0) return ["  No matching commands"];
  const win = view.selection.window(view.maxVisible);
  const lines = win.items.map((item, offset) => renderItem(view, item, win.start + offset === view.selection.selectedIndex, width));
  if (win.start > 0 || win.end < view.selection.filteredItems.length) lines.push(`  (${view.selection.selectedIndex + 1}/${view.selection.filteredItems.length})`);
  return lines;
};

export const renderSelectStyled = (view: SelectListView, width: number): StyledText => {
  const total = view.selection.filteredItems.length;
  const win = view.selection.window(view.maxVisible);
  const rows: SelectStyledRow[] = win.items.map((item, offset) => {
    const selected = win.start + offset === view.selection.selectedIndex;
    return { line: renderItem(view, item, selected, width), labelEnd: 2 + visibleWidth(primaryLabel(view, item, selected, width)), selected };
  });
  const scroll = win.start > 0 || win.end < total ? `  (${view.selection.selectedIndex + 1}/${total})` : undefined;
  return selectListStyled(rows, scroll, view.theme, width);
};
