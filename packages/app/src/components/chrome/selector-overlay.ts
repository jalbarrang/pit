import { BoxRenderable, type RenderContext } from "@opentui/core";
import { Container, Input, SelectList, type Focusable, type SelectItem } from "@pit/tui";

export interface SelectorOverlayOptions {
  items: SelectItem[];
  initialIndex?: number;
  searchable?: boolean;
  initialSearch?: string;
  maxVisible?: number;
  borderColor?: string | number;
}

interface InjectedRenderables { box?: never; list?: never; search?: never }

const createBox = (ctx: RenderContext, borderColor?: string | number): BoxRenderable =>
  new BoxRenderable(ctx, { flexDirection: "column", width: "100%", height: "auto", border: true, ...(borderColor !== undefined ? { borderColor } : {}) } as never);

/** One character (or paste chunk) of typed text, as opposed to nav/control sequences. */
const isTextInput = (data: string): boolean => data === "\x7f" || (!data.startsWith("\x1b") && data >= " ");

export class SelectorOverlay extends Container implements Focusable {
  readonly list: SelectList;
  onSelect?: (item: SelectItem) => void;
  onCancel?: () => void;
  onSelectionChange?: (item: SelectItem) => void;
  private readonly search?: Input;
  private _focused = false;

  constructor(ctx: RenderContext, options: SelectorOverlayOptions, inject: InjectedRenderables = {}) {
    super(ctx, inject.box ?? createBox(ctx, options.borderColor));
    this.list = new SelectList(ctx, options.items, options.maxVisible ?? 10, {}, {}, inject.list);
    if (options.searchable) {
      this.search = new Input(ctx, inject.search);
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

  private applyFilter(): void {
    this.list.setFilter(this.search?.getValue() ?? "");
  }
}
