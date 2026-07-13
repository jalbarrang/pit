import type { StyledText } from "@opentui/core";
import type { ListSelection } from "../domain/input/index.ts";
import { truncateToWidth, visibleWidth } from "../domain/styling/index.ts";
import { settingsListStyled, type SettingsStyledRow } from "./list-styled.ts";
import type { SettingItem, SettingsListTheme } from "./settings-list-types.ts";

export interface SettingsListView {
  selection: ListSelection<SettingItem>;
  maxVisible: number;
  theme: SettingsListTheme;
  filter: string;
}

const HINT = "  Enter/Space to change · Esc to cancel";
const maxLabelWidth = (items: SettingItem[]): number => Math.min(30, Math.max(...items.map((item) => visibleWidth(item.label))));
const emptyText = (view: SettingsListView): string => (view.filter ? "  No matching settings" : "  No settings available");

const renderItem = (view: SettingsListView, item: SettingItem, selected: boolean, width: number, labelWidth: number): string => {
  const prefix = selected ? view.theme.cursor ?? "→ " : "  ";
  const label = item.label + " ".repeat(Math.max(0, labelWidth - visibleWidth(item.label)));
  return truncateToWidth(`${prefix}${label}  ${item.currentValue}`, width, "", true);
};

export const renderSettingsLines = (view: SettingsListView, width: number): string[] => {
  const items = view.selection.filteredItems;
  if (items.length === 0) return [emptyText(view)];
  const maxLabel = maxLabelWidth(items);
  const win = view.selection.window(view.maxVisible);
  const lines = win.items.map((item, offset) => renderItem(view, item, win.start + offset === view.selection.selectedIndex, width, maxLabel));
  if (win.start > 0 || win.end < items.length) lines.push(`  (${view.selection.selectedIndex + 1}/${items.length})`);
  const selected = view.selection.selectedItem;
  if (selected?.description) lines.push("", `  ${truncateToWidth(selected.description, width - 2)}`);
  lines.push("", HINT);
  return lines;
};

export const renderSettingsStyled = (view: SettingsListView, width: number): StyledText => {
  const items = view.selection.filteredItems;
  if (items.length === 0) return settingsListStyled({ empty: emptyText(view) }, view.theme, width);
  const maxLabel = maxLabelWidth(items);
  const win = view.selection.window(view.maxVisible);
  const rows: SettingsStyledRow[] = win.items.map((item, offset) => {
    const selected = win.start + offset === view.selection.selectedIndex;
    const prefixWidth = visibleWidth(selected ? view.theme.cursor ?? "→ " : "  ");
    return { line: renderItem(view, item, selected, width, maxLabel), prefixWidth, labelWidth: maxLabel, selected };
  });
  const description = view.selection.selectedItem?.description;
  return settingsListStyled({
    rows,
    ...(win.start > 0 || win.end < items.length ? { scroll: `  (${view.selection.selectedIndex + 1}/${items.length})` } : {}),
    ...(description ? { description: `  ${truncateToWidth(description, width - 2)}` } : {}),
    hint: HINT,
  }, view.theme, width);
};
