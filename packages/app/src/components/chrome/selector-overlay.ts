import type { RenderContext, StyledText } from "@opentui/core";
import { Container, getKeybindings, Input, SelectList, Text, type Focusable, type PitStyle, type SelectItem, type SelectListTheme } from "@pit/tui";
import { createOverlayBox, isTextInput } from "./overlay-parts.ts";

export interface SelectorOverlayOptions {
  items: SelectItem[];
  initialIndex?: number;
  searchable?: boolean;
  initialSearch?: string;
  header?: string | StyledText;
  maxVisible?: number;
  borderColor?: string | number;
  listTheme?: SelectListTheme;
  searchStyle?: PitStyle;
}

interface InjectedRenderables { box?: never; list?: never; search?: never; header?: never }

export class SelectorOverlay extends Container implements Focusable {
  readonly list: SelectList;
  onSelect?: (item: SelectItem) => void;
  onCancel?: () => void;
  onSelectionChange?: (item: SelectItem) => void;
  onTab?: () => void;
  private readonly search?: Input;
  private readonly header?: Text;
  private _focused = false;

  constructor(ctx: RenderContext, options: SelectorOverlayOptions, inject: InjectedRenderables = {}) {
    super(ctx, inject.box ?? createOverlayBox(ctx, options.borderColor));
    this.list = new SelectList(ctx, options.items, options.maxVisible ?? 10, options.listTheme ?? {}, {}, inject.list);
    if (options.header !== undefined) {
      this.header = new Text(ctx, options.header, 0, 0, undefined, inject.header);
      this.addChild(this.header);
    }
    if (options.searchable) {
      this.search = new Input(ctx, inject.search, options.searchStyle);
      this.addChild(this.search);
    }
    this.addChild(this.list);
    this.list.setSelectedIndex(options.initialIndex ?? 0);
    if (options.initialSearch) {
      this.search?.setValue(options.initialSearch);
      this.applyFilter();
    }
    this.list.onSelect = (item) => this.onSelect?.(item);
    this.list.onCancel = () => this.onCancel?.();
    this.list.onSelectionChange = (item) => this.onSelectionChange?.(item);
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) {
    this._focused = value;
    if (this.search) this.search.focused = value;
  }

  override handleInput(data: string): void {
    if (this.onTab && getKeybindings().matches(data, "tui.input.tab")) return this.onTab();
    if (this.search && isTextInput(data)) {
      this.search.handleInput(data);
      this.applyFilter();
      return;
    }
    this.list.handleInput(data);
  }

  setWidth(width: number): void {
    this.search?.setWidth(width - 2);
    this.list.setWidth(width - 2);
  }

  /** Swap the item universe (e.g. scope toggle), re-applying the active search filter. */
  setItems(items: SelectItem[], selectedIndex = 0): void {
    this.list.items = items;
    this.applyFilter();
    this.list.setSelectedIndex(selectedIndex);
  }

  setHeader(content: string | StyledText): void {
    this.header?.setText(content);
  }

  private applyFilter(): void {
    this.list.setFilter(this.search?.getValue() ?? "");
  }
}
