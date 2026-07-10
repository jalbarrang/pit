import { BoxRenderable, TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Container, fuzzyFilter, getKeybindings, ListSelection, type Focusable } from "@pit/tui";
import {
  clearAll, enableAll, reorder, toggle, toggleProvider, type ScopedState,
} from "../../domain/models/scoped-state.ts";
import { formatOverlayLines, type ScopedModelItem } from "./scoped-models-rows.ts";

export interface ScopedModelsOverlayOptions { items: ScopedModelItem[]; initial: string[] | null; maxVisible?: number }

type TextLike = Renderable & { content: string; width?: number };
interface Injected { box?: BoxRenderable; body?: TextLike }

const createBox = (ctx: RenderContext): BoxRenderable =>
  new BoxRenderable(ctx, { flexDirection: "column", width: "100%", height: "auto", border: true } as never);
const createBody = (ctx: RenderContext): TextLike =>
  new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none" }) as unknown as TextLike;
const isTextInput = (data: string): boolean => data === "\x7f" || (!data.startsWith("\x1b") && data >= " ");
const itemText = (item: ScopedModelItem): string => `${item.id} ${item.label} ${item.provider}`;

export class ScopedModelsOverlay extends Container implements Focusable {
  readonly body: TextLike;
  onChange?: (enabled: string[] | null) => void;
  onPersist?: (enabled: string[] | null) => void;
  onCancel?: () => void;
  private state: ScopedState;
  private query = "";
  private readonly selection: ListSelection<ScopedModelItem>;
  private readonly universe: string[];
  private readonly allItems: ScopedModelItem[];
  private readonly maxVisible: number;
  private _focused = false;

  constructor(ctx: RenderContext, options: ScopedModelsOverlayOptions, inject: Injected = {}) {
    super(ctx, inject.box ?? createBox(ctx));
    this.allItems = options.items;
    this.universe = options.items.map((item) => item.id);
    this.state = { enabled: options.initial };
    this.maxVisible = options.maxVisible ?? 12;
    this.selection = new ListSelection(options.items);
    this.body = inject.body ?? createBody(ctx);
    this.renderable.add(this.body);
    this.paint();
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; }
  setWidth(width: number): void { this.body.width = width - 2; this.paint(); }

  handleInput(data: string): void {
    const kb = getKeybindings();
    const ids = () => this.selection.filteredItems.map((item) => item.id);
    if (kb.matches(data, "tui.select.up")) this.selection.move(-1);
    else if (kb.matches(data, "tui.select.down")) this.selection.move(1);
    else if (kb.matches(data, "tui.select.confirm")) this.mutate((s, id) => toggle(s, id, this.universe));
    else if (kb.matches(data, "app.models.enableAll")) this.apply((s) => enableAll(s, ids(), this.universe));
    else if (kb.matches(data, "app.models.clearAll")) this.apply((s) => clearAll(s, ids(), this.universe));
    else if (kb.matches(data, "app.models.toggleProvider")) this.mutate((s, _, p) => toggleProvider(s, p, this.universe));
    else if (kb.matches(data, "app.models.reorderUp")) this.mutate((s, id) => reorder(s, id, -1));
    else if (kb.matches(data, "app.models.reorderDown")) this.mutate((s, id) => reorder(s, id, 1));
    else if (kb.matches(data, "app.models.save")) this.onPersist?.(this.state.enabled);
    else if (kb.matches(data, "tui.select.cancel")) this.cancelOrClear();
    else if (isTextInput(data)) this.type(data);
    this.paint();
  }

  private apply(fn: (state: ScopedState) => ScopedState): void {
    this.state = fn(this.state);
    this.onChange?.(this.state.enabled);
  }

  private mutate(fn: (state: ScopedState, id: string, provider: string) => ScopedState): void {
    const item = this.selection.selectedItem;
    if (item) this.apply((s) => fn(s, item.id, item.provider));
  }

  private cancelOrClear(): void {
    if (this.query) { this.query = ""; this.refilter(); return; }
    this.onCancel?.();
  }

  private type(data: string): void {
    this.query = data === "\x7f" ? this.query.slice(0, -1) : this.query + data;
    this.refilter();
  }

  private refilter(): void {
    const q = this.query.trim();
    this.selection.replaceFiltered(q ? fuzzyFilter(this.allItems, q, itemText) : this.allItems);
  }

  private paint(): void {
    this.body.content = formatOverlayLines(
      this.selection.filteredItems, this.state, this.universe, this.selection.selectedIndex, this.query, this.maxVisible,
    ).join("\n");
    this.invalidate();
  }
}
