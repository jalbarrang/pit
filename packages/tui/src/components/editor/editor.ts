import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { EditorModel } from "../../domain/editing/index.ts";
import { Component, type Focusable } from "../component.ts";
import { textOptions } from "../component-style.ts";
import { editorKey, printableInput } from "./keymap.ts";
import { defaultEditorTheme } from "./theme.ts";
import type { EditorComponent, EditorOptions, EditorTheme } from "./types.ts";
import { renderViewport, withCursor } from "./viewport.ts";

type TextLike = Renderable & { content: string; width?: number; height?: number | string; options?: Record<string, unknown> };
const makeRenderable = (ctx: RenderContext, theme: EditorTheme): TextLike => new TextRenderable(ctx, { content: "", height: "auto", wrapMode: "none", ...textOptions({ fg: theme.textColor }) }) as TextLike;

export class Editor extends Component implements Focusable, EditorComponent {
  readonly renderable: TextLike;
  readonly model = new EditorModel();
  onSubmit?: (text: string) => void;
  onChange?: (text: string) => void;
  borderColor: (str: string) => string;
  private theme: EditorTheme;
  private paddingX: number;
  private maxHeight: number;
  private _focused = false;

  constructor(ctx: RenderContext, theme: EditorTheme = defaultEditorTheme, options: EditorOptions = {}, renderable?: TextLike) {
    super();
    this.theme = { ...defaultEditorTheme, ...theme };
    this.paddingX = Math.max(0, Math.floor(options.paddingX ?? 0));
    this.maxHeight = Math.max(1, Math.floor(options.maxHeight ?? 8));
    this.model.width = Math.max(1, Math.floor(options.width ?? 80) - this.paddingX * 2);
    this.borderColor = this.theme.borderColor ?? ((text) => text);
    this.renderable = renderable ?? makeRenderable(ctx, this.theme);
    this.update();
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; this.update(); }
  getText(): string { return this.model.getText(); }
  getExpandedText(): string { return this.getText(); }
  getCursor() { return this.model.getCursor(); }
  getLines(): string[] { return this.model.getLines(); }
  setText(text: string): void { this.model.setText(text); this.changed(); }
  addToHistory(text: string): void { this.model.addToHistory(text); }
  insertTextAtCursor(text: string): void { this.model.insert(text, true); this.changed(); }
  setPaddingX(padding: number): void { this.paddingX = Math.max(0, Math.floor(padding)); this.update(); }
  setAutocompleteMaxVisible(_maxVisible: number): void {}

  handleInput(data: string): void {
    const key = editorKey(data);
    if (key === "submit") { const value = this.model.submit(); this.changed(false); this.onSubmit?.(value); return; }
    if (key === "newline") this.model.newline();
    else if (key === "backspace") this.model.backspace();
    else if (key === "delete") this.model.deleteForward();
    else if (key === "left") this.model.left();
    else if (key === "right") this.model.right();
    else if (key === "up") this.model.up();
    else if (key === "down") this.model.down();
    else if (key === "home") this.model.start();
    else if (key === "end") this.model.end();
    else if (key === "wordLeft") this.model.wordLeft();
    else if (key === "wordRight") this.model.wordRight();
    else if (key === "undo") this.model.undo();
    else if (key === "redo") this.model.redo();
    else {
      const printable = printableInput(data);
      if (printable === null) return;
      this.model.insert(printable);
    }
    this.changed();
  }

  private changed(fire = true): void { if (fire) this.onChange?.(this.getText()); this.update(); }
  private update(): void {
    const width = this.model.width;
    const view = renderViewport(this.model.getState(), width, this.maxHeight, this.model.getCursor());
    const body = withCursor(view.lines, view.cursorRow, view.cursorCol, this.focused).map((line) => " ".repeat(this.paddingX) + line);
    this.renderable.content = body.join("\n");
    this.renderable.width = width + this.paddingX * 2;
    this.invalidate();
  }
}
