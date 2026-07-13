import { TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";
import { fuzzyFilter, getKeybindings, ListSelection, matchesKey } from "../domain/input/index.ts";
import { Component } from "./component.ts";
import { renderSettingsLines, renderSettingsStyled, type SettingsListView } from "./settings-list-render.ts";
import type { SettingItem, SettingsChange, SettingsListOptions, SettingsListTheme } from "./settings-list-types.ts";

type TextLike = Renderable & { content: string | StyledText; width?: number };
const createRenderable = (ctx: RenderContext): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as unknown as TextLike;

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
    return renderSettingsLines(this.view(), width);
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
  private view(): SettingsListView { return { selection: this.selection, maxVisible: this.maxVisible, theme: this.theme, filter: this.filter }; }
  private themed(): boolean { return Object.keys(this.theme).length > 0; }
  private update(): void {
    const styled = this.themed() && !this.submenu;
    this.renderable.content = styled ? renderSettingsStyled(this.view(), this.width) : this.render(this.width).join("\n");
    this.invalidate();
  }
}
