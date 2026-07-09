import { TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";
import { EditorModel } from "../../domain/editing/index.ts";
import type { AutocompleteProvider } from "../../domain/input/index.ts";
import { Component, type Focusable } from "../component.ts";
import { textOptions } from "../component-style.ts";
import { EditorAutocomplete } from "./autocomplete-popup.ts";
import { buildEditorContent } from "./content.ts";
import { applyEditorCommand } from "./command-dispatch.ts";
import { editorKey, printableInput } from "./keymap.ts";
import { cleanPaste, parseBracketedPaste } from "./paste.ts";
import { defaultEditorTheme } from "./theme.ts";
import type { EditorComponent, EditorOptions, EditorTheme } from "./types.ts";
import { renderViewport } from "./viewport.ts";
type TextLike = Renderable & { content: string | StyledText; width?: number; height?: number | string; options?: Record<string, unknown> };
const makeRenderable = (ctx: RenderContext, theme: EditorTheme): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none", ...textOptions({ fg: theme.textColor }) }) as unknown as TextLike;
export class Editor extends Component implements Focusable, EditorComponent {
  readonly renderable: TextLike;
  readonly model = new EditorModel();
  onSubmit?: (text: string) => void;
  onChange?: (text: string) => void;
  borderColor?: string;
  private paddingX: number;
  private maxHeight: number;
  private _focused = false;
  private autocomplete: EditorAutocomplete;
  constructor(ctx: RenderContext, theme: EditorTheme = defaultEditorTheme, options: EditorOptions = {}, renderable?: TextLike) {
    super();
    const merged = { ...defaultEditorTheme, ...theme };
    this.paddingX = Math.max(0, Math.floor(options.paddingX ?? 0));
    this.maxHeight = Math.max(1, Math.floor(options.maxHeight ?? 8));
    this.model.width = Math.max(1, Math.floor(options.width ?? 80) - this.paddingX * 2);
    this.borderColor = merged.borderColor;
    this.autocomplete = new EditorAutocomplete(ctx, merged.selectList, options.autocompleteMaxVisible ?? 5);
    this.renderable = renderable ?? makeRenderable(ctx, merged);
    this.update();
  }
  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; this.update(); }
  getText(): string { return this.model.getText(); }
  getExpandedText(): string { return this.getText(); }
  getCursor() { return this.model.getCursor(); }
  getLines(): string[] { return this.model.getLines(); }
  getAutocompleteItems() { return this.autocomplete.items; }
  isShowingAutocomplete(): boolean { return this.autocomplete.active; }
  setAutocompleteProvider(provider: AutocompleteProvider): void { this.autocomplete.setProvider(provider); }
  setText(text: string): void { this.model.setText(text); this.changed(); }
  addToHistory(text: string): void { this.model.addToHistory(text); }
  insertTextAtCursor(text: string): void { this.model.insert(text, true); this.changed(); }
  setPaddingX(padding: number): void { this.paddingX = Math.max(0, Math.floor(padding)); this.update(); }
  setAutocompleteMaxVisible(maxVisible: number): void { this.autocomplete.setMaxVisible(maxVisible); }
  handleInput(data: string): void {
    if (this.handlePaste(data)) return;
    const key = editorKey(data);
    if (key && this.handleAutocompleteKey(key, data)) return;
    const result = key ? applyEditorCommand(this.model, key) : "ignored";
    if (result === "submit") { const value = this.model.submit(); this.changed(false); this.onSubmit?.(value); return; }
    if (result === "handled") { this.changed(); void this.requestAutocomplete(false); return; }
    const printable = printableInput(data);
    if (printable === null) return;
    this.model.insert(printable);
    this.changed();
    void this.requestAutocomplete(false);
  }
  private handlePaste(data: string): boolean {
    const parsed = parseBracketedPaste(data);
    if (!parsed) return false;
    this.model.insert(cleanPaste(parsed.paste ?? ""), true);
    this.changed();
    if (parsed.remaining) this.handleInput(parsed.remaining);
    return true;
  }
  private handleAutocompleteKey(key: string, data: string): boolean {
    if (key === "escape" && this.autocomplete.active) { this.autocomplete.dismiss(); this.update(); return true; }
    if ((key === "up" || key === "down") && this.autocomplete.active) { this.autocomplete.move(data); this.update(); return true; }
    if ((key === "tab" || key === "submit") && this.autocomplete.active) return this.acceptAutocomplete();
    if (key === "tab") { void this.requestAutocomplete(true); return true; }
    return false;
  }
  private acceptAutocomplete(): boolean {
    const cursor = this.model.getCursor();
    const result = this.autocomplete.accept(this.model.getLines(), cursor.line, cursor.col);
    if (!result) return false;
    this.model.replace(result.lines, { line: result.cursorLine, col: result.cursorCol });
    this.changed();
    return true;
  }
  private async requestAutocomplete(force: boolean): Promise<void> {
    const cursor = this.model.getCursor();
    await this.autocomplete.request(this.model.getLines(), cursor.line, cursor.col, force);
    this.update();
  }
  private changed(fire = true): void { if (fire) this.onChange?.(this.getText()); this.update(); }
  private update(): void {
    const width = this.model.width;
    const view = renderViewport(this.model.getState(), width, this.maxHeight, this.model.getCursor());
    this.renderable.content = buildEditorContent(view, { width, paddingX: this.paddingX, focused: this.focused, borderColor: this.borderColor, extraLines: this.autocomplete.render(width) });
    this.renderable.width = width + this.paddingX * 2;
    this.invalidate();
  }
}
