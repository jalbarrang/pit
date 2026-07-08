import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { fuzzyFilter, getKeybindings, ListSelection, matchesKey } from "../domain/input/index.ts";
import { truncateToWidth, visibleWidth } from "../domain/styling/index.ts";
import { Component } from "./component.ts";
import type { SettingItem, SettingsChange, SettingsListOptions, SettingsListTheme } from "./settings-list-types.ts";

type TextLike = Renderable & { content: string; width?: number };
const createRenderable = (ctx: RenderContext): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as TextLike;

export class SettingsList extends Component {
  readonly renderable: TextLike;
  readonly selection: ListSelection<SettingItem>;
  private width = 80;
  private filter = "";
  private submenu: Component | null = null;
  private maxVisible: number;
  private theme: SettingsListTheme;
  private onChange: SettingsChange;
  private onCancel: () => void;
  private options: SettingsListOptions;
  constructor(ctx: RenderContext, items: SettingItem[], maxVisible: number, theme: SettingsListTheme, onChange: SettingsChange, onCancel: () => void, options: SettingsListOptions = {}, renderable?: TextLike) {
    super();
    this.maxVisible = maxVisible;
    this.theme = theme;
    this.onChange = onChange;
    this.onCancel = onCancel;
    this.options = options;
    this.selection = new ListSelection(items);
    this.renderable = renderable ?? createRenderable(ctx);
    this.update();
  }

  updateValue(id: string, newValue: string): void {
    const item = this.selection.items.find((candidate) => candidate.id === id);
    if (item) item.currentValue = newValue;
    this.applyFilter();
  }
  getSelectedItem(): SettingItem | null { return this.selection.selectedItem; }
  setWidth(width: number): void { this.width = width; this.renderable.width = width; this.update(); }

  handleInput(data: string): void {
    if (this.submenu) { this.submenu.handleInput?.(data); return; }
    const kb = getKeybindings();
    if (kb.matches(data, "tui.select.up")) this.selection.move(-1);
    else if (kb.matches(data, "tui.select.down")) this.selection.move(1);
    else if (kb.matches(data, "tui.select.confirm") || data === " ") this.activate(1);
    else if (matchesKey(data, "left")) this.activate(-1);
    else if (matchesKey(data, "right")) this.activate(1);
    else if (kb.matches(data, "tui.select.cancel")) this.onCancel();
    else if (this.options.enableSearch && data.trim()) { this.filter += data.replace(/\s/g, ""); this.applyFilter(); }
    this.update();
  }

  render(width: number): string[] {
    if (this.submenu && "render" in this.submenu && typeof this.submenu.render === "function") return this.submenu.render(width) as string[];
    const items = this.selection.filteredItems;
    if (items.length === 0) return [this.filter ? "  No matching settings" : "  No settings available"];
    const maxLabel = Math.min(30, Math.max(...items.map((item) => visibleWidth(item.label))));
    const win = this.selection.window(this.maxVisible);
    const lines = win.items.map((item, offset) => this.renderItem(item, win.start + offset === this.selection.selectedIndex, width, maxLabel));
    if (win.start > 0 || win.end < items.length) lines.push(`  (${this.selection.selectedIndex + 1}/${items.length})`);
    const selected = this.selection.selectedItem;
    if (selected?.description) lines.push("", `  ${truncateToWidth(selected.description, width - 2)}`);
    lines.push("", "  Enter/Space to change · Esc to cancel");
    return lines;
  }

  private renderItem(item: SettingItem, selected: boolean, width: number, labelWidth: number): string {
    const prefix = selected ? this.theme.cursor ?? "→ " : "  ";
    const label = item.label + " ".repeat(Math.max(0, labelWidth - visibleWidth(item.label)));
    return truncateToWidth(`${prefix}${label}  ${item.currentValue}`, width, "", true);
  }

  private activate(direction: 1 | -1): void {
    const item = this.selection.selectedItem;
    if (!item) return;
    if (item.submenu) return this.openSubmenu(item);
    if (!item.values?.length) return;
    const current = item.values.indexOf(item.currentValue);
    const next = (current + direction + item.values.length) % item.values.length;
    item.currentValue = item.values[next]!;
    this.onChange(item.id, item.currentValue);
  }

  private openSubmenu(item: SettingItem): void {
    this.submenu = item.submenu?.(item.currentValue, (value?: string) => {
      if (value !== undefined) { item.currentValue = value; this.onChange(item.id, value); }
      this.submenu = null;
    }) ?? null;
  }
  private applyFilter(): void {
    const items = this.filter ? fuzzyFilter(this.selection.items, this.filter, (item) => item.label) : this.selection.items;
    this.selection.replaceFiltered(items);
    this.update();
  }
  private update(): void { this.renderable.content = this.render(this.width).join("\n"); this.invalidate(); }
}
