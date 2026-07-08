import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { TextFieldModel } from "../domain/input/index.ts";
import { Component, type Focusable } from "./component.ts";
import { textOptions, type PitStyle } from "./component-style.ts";

type InputLike = Renderable & { content: string; width?: number; options?: Record<string, unknown> };
const createRenderable = (ctx: RenderContext, style?: PitStyle): InputLike =>
  new TextRenderable(ctx, { content: "> ", height: 1, wrapMode: "none", truncate: true, ...textOptions(style) }) as InputLike;

export class Input extends Component implements Focusable {
  readonly renderable: InputLike;
  readonly model = new TextFieldModel();
  onSubmit?: (value: string) => void;
  onEscape?: () => void;
  private _focused = false;
  private width = 80;

  constructor(ctx: RenderContext, renderable?: InputLike, style?: PitStyle) {
    super();
    this.renderable = renderable ?? createRenderable(ctx, style);
    this.renderable.options = { ...this.renderable.options, ...textOptions(style) };
    this.update();
  }

  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; this.update(); }
  get value(): string { return this.model.value; }
  set value(value: string) { this.setValue(value); }

  getValue(): string { return this.model.value; }
  setValue(value: string): void { this.model.setValue(value); this.update(); }
  getCursor(): number { return this.model.cursor; }
  setWidth(width: number): void { this.width = width; this.renderable.width = width; this.update(); }

  handleInput(data: string): void {
    const action = this.model.handleInput(data);
    if (action === "submit") this.onSubmit?.(this.model.value);
    if (action === "escape") this.onEscape?.();
    if (action !== "none") this.update();
  }

  private update(): void {
    this.renderable.content = this.model.window(this.width, this.focused);
    this.invalidate();
  }
}
