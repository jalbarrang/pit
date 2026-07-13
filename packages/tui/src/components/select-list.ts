import { TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";
import { fuzzyFilter, getKeybindings, ListSelection } from "../domain/input/index.ts";
import { Component } from "./component.ts";
import { renderSelectLines, renderSelectStyled, type SelectListView } from "./select-list-render.ts";
import type { SelectItem, SelectListLayoutOptions, SelectListTheme } from "./select-list-types.ts";

type TextLike = Renderable & { content: string | StyledText; width?: number; options?: Record<string, unknown> };
const createRenderable = (ctx: RenderContext): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as unknown as TextLike;

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

  render(width: number): string[] { return renderSelectLines(this.view(), width); }

  private view(): SelectListView { return { selection: this.selection, maxVisible: this.maxVisible, theme: this.theme, layout: this.layout }; }
  private themed(): boolean { return Object.keys(this.theme).length > 0; }
  private fireSelect(): void { const item = this.selection.selectedItem; if (item) this.onSelect?.(item); }
  private update(): void {
    this.renderable.content = this.themed() ? renderSelectStyled(this.view(), this.width) : this.render(this.width).join("\n");
    this.invalidate();
  }
}
