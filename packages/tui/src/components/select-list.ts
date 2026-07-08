import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { fuzzyFilter, getKeybindings, ListSelection } from "../domain/input/index.ts";
import { truncateToWidth, visibleWidth } from "../domain/styling/index.ts";
import { Component } from "./component.ts";
import type { SelectItem, SelectListLayoutOptions, SelectListTheme } from "./select-list-types.ts";

const DEFAULT_PRIMARY_COLUMN_WIDTH = 32;
const PRIMARY_COLUMN_GAP = 2;
type TextLike = Renderable & { content: string; width?: number; options?: Record<string, unknown> };
const createRenderable = (ctx: RenderContext): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as TextLike;
const normalize = (text = ""): string => text.replace(/[\r\n]+/g, " ").trim();
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));

export class SelectList extends Component {
  readonly renderable: TextLike;
  readonly selection: ListSelection<SelectItem>;
  onSelect?: (item: SelectItem) => void;
  onCancel?: () => void;
  onSelectionChange?: (item: SelectItem) => void;
  private width = 80;
  private maxVisible: number;
  private theme: SelectListTheme;
  private layout: SelectListLayoutOptions;

  constructor(ctx: RenderContext, items: SelectItem[], maxVisible: number, theme: SelectListTheme = {}, layout: SelectListLayoutOptions = {}, renderable?: TextLike) {
    super();
    this.maxVisible = maxVisible;
    this.theme = theme;
    this.layout = layout;
    this.selection = new ListSelection(items);
    this.renderable = renderable ?? createRenderable(ctx);
    this.update();
  }

  get items(): SelectItem[] { return this.selection.items; }
  set items(items: SelectItem[]) { this.selection.items = items; this.update(); }
  setFilter(filter: string): void {
    const query = filter.trim();
    const items = query ? fuzzyFilter(this.selection.items, query, (item) => `${item.value} ${item.label} ${item.description ?? ""}`) : this.selection.items;
    this.selection.replaceFiltered(items);
    this.update();
  }
  setSelectedIndex(index: number): void { this.selection.setSelectedIndex(index); this.update(); }
  getSelectedItem(): SelectItem | null { return this.selection.selectedItem; }
  setWidth(width: number): void { this.width = width; this.renderable.width = width; this.update(); }

  handleInput(data: string): void {
    const kb = getKeybindings();
    const before = this.selection.selectedItem;
    if (kb.matches(data, "tui.select.up")) this.selection.move(-1);
    else if (kb.matches(data, "tui.select.down")) this.selection.move(1);
    else if (kb.matches(data, "tui.select.pageUp")) this.selection.page(-this.maxVisible);
    else if (kb.matches(data, "tui.select.pageDown")) this.selection.page(this.maxVisible);
    else if (kb.matches(data, "tui.editor.cursorLineStart")) this.selection.home();
    else if (kb.matches(data, "tui.editor.cursorLineEnd")) this.selection.end();
    else if (kb.matches(data, "tui.select.confirm")) this.fireSelect();
    else if (kb.matches(data, "tui.select.cancel")) this.onCancel?.();
    if (before !== this.selection.selectedItem) this.onSelectionChange?.(this.selection.selectedItem!);
    this.update();
  }

  render(width: number): string[] {
    if (this.selection.filteredItems.length === 0) return ["  No matching commands"];
    const win = this.selection.window(this.maxVisible);
    const lines = win.items.map((item, offset) => this.renderItem(item, win.start + offset === this.selection.selectedIndex, width));
    if (win.start > 0 || win.end < this.selection.filteredItems.length) lines.push(`  (${this.selection.selectedIndex + 1}/${this.selection.filteredItems.length})`);
    return lines;
  }

  private renderItem(item: SelectItem, selected: boolean, width: number): string {
    const prefix = selected ? "→ " : "  ";
    const primaryWidth = this.primaryColumnWidth();
    const label = this.truncatePrimary(item, selected, Math.min(primaryWidth, width - 4), primaryWidth);
    const desc = normalize(item.description);
    if (!desc || width <= 40) return truncateToWidth(`${prefix}${label}`, width, "", true);
    const spacing = " ".repeat(Math.max(1, primaryWidth - visibleWidth(label)));
    return truncateToWidth(`${prefix}${label}${spacing}${desc}`, width, "", true);
  }

  private primaryColumnWidth(): number {
    const min = this.layout.minPrimaryColumnWidth ?? this.layout.maxPrimaryColumnWidth ?? DEFAULT_PRIMARY_COLUMN_WIDTH;
    const max = this.layout.maxPrimaryColumnWidth ?? this.layout.minPrimaryColumnWidth ?? DEFAULT_PRIMARY_COLUMN_WIDTH;
    const widest = Math.max(1, ...this.selection.filteredItems.map((item) => visibleWidth(item.label || item.value) + PRIMARY_COLUMN_GAP));
    return clamp(widest, Math.min(min, max), Math.max(min, max));
  }

  private truncatePrimary(item: SelectItem, selected: boolean, maxWidth: number, columnWidth: number): string {
    const text = item.label || item.value;
    const custom = this.layout.truncatePrimary?.({ text, maxWidth, columnWidth, item, isSelected: selected }) ?? text;
    return truncateToWidth(custom, Math.max(1, maxWidth), "…");
  }

  private fireSelect(): void { const item = this.selection.selectedItem; if (item) this.onSelect?.(item); }
  private update(): void { this.renderable.content = this.render(this.width).join("\n"); this.invalidate(); }
}
