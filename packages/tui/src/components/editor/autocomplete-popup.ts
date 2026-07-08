import type { RenderContext, Renderable } from "@opentui/core";
import type { AutocompleteItem, AutocompleteProvider } from "../../domain/input/index.ts";
import { SelectList } from "../select-list.ts";
import type { SelectListTheme } from "../select-list-types.ts";

export class EditorAutocomplete {
  private provider?: AutocompleteProvider;
  private list?: SelectList;
  private prefix = "";
  private maxVisible: number;
  private requestId = 0;
  private ctx: RenderContext;
  private theme: SelectListTheme;
  constructor(ctx: RenderContext, theme: SelectListTheme = {}, maxVisible = 5) {
    this.ctx = ctx;
    this.theme = theme;
    this.maxVisible = maxVisible;
  }
  setProvider(provider: AutocompleteProvider): void { this.provider = provider; this.dismiss(); }
  setMaxVisible(value: number): void { this.maxVisible = Math.max(3, Math.min(20, Math.floor(value))); }
  get active(): boolean { return this.list !== undefined; }
  get items(): AutocompleteItem[] { return this.list?.items ?? []; }
  selected(): AutocompleteItem | null { return this.list?.getSelectedItem() ?? null; }
  dismiss(): void { this.list = undefined; this.prefix = ""; this.requestId++; }
  move(data: string): void { this.list?.handleInput(data); }
  async request(lines: string[], cursorLine: number, cursorCol: number, force = false): Promise<void> {
    if (!this.provider) return;
    const id = ++this.requestId;
    const controller = new AbortController();
    const result = await this.provider.getSuggestions(lines, cursorLine, cursorCol, { signal: controller.signal, force });
    if (id !== this.requestId) return;
    if (!result?.items.length) { this.dismiss(); return; }
    this.prefix = result.prefix;
    this.list = new SelectList(this.ctx, result.items, this.maxVisible, this.theme, {}, fakeRenderable());
    const exact = result.items.findIndex((item) => item.value === result.prefix || item.label === result.prefix);
    if (exact >= 0) this.list.setSelectedIndex(exact);
  }
  accept(lines: string[], cursorLine: number, cursorCol: number) {
    const item = this.selected();
    if (!item || !this.provider) return null;
    const result = this.provider.applyCompletion(lines, cursorLine, cursorCol, item, this.prefix);
    this.dismiss();
    return result;
  }
  render(width: number): string[] { return this.list?.render(width) ?? []; }
}

const fakeRenderable = () => ({ content: "", requestRender() {}, add() { return 0; }, remove() {}, getChildren() { return []; }, getChildrenCount() { return 0; } }) as unknown as Renderable & { content: string };
