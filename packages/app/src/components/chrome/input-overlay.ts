import { BoxRenderable, TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Container, Input, Text, type Focusable } from "@pit/tui";

type TextLike = Renderable & { content: string; width?: number };
const box = (ctx: RenderContext): BoxRenderable => new BoxRenderable(ctx, { flexDirection: "column", width: "100%", height: "auto", border: true } as never);
const fake = (ctx: RenderContext): TextLike => new TextRenderable(ctx, { content: "", height: 1 }) as unknown as TextLike;

export class InputOverlay extends Container implements Focusable {
  readonly input: Input;
  onSubmit?: (value: string) => void;
  onCancel?: () => void;
  private readonly inputText: TextLike;
  private _focused = false;
  private readonly masked: boolean;
  constructor(ctx: RenderContext, title: string, masked = false) {
    super(ctx, box(ctx));
    this.masked = masked;
    this.addChild(new Text(ctx, title, 1));
    this.inputText = fake(ctx);
    this.input = new Input(ctx, this.inputText as never);
    this.input.onSubmit = (value) => this.onSubmit?.(value);
    this.input.onEscape = () => this.onCancel?.();
    this.addChild(this.input);
    this.addChild(new Text(ctx, "Enter to save · Esc to cancel", 1));
  }
  get focused(): boolean { return this._focused; }
  set focused(value: boolean) { this._focused = value; this.input.focused = value; }
  override handleInput(data: string): void { this.input.handleInput(data); if (this.masked) this.mask(); }
  setWidth(width: number): void { this.input.setWidth(width - 2); }
  private mask(): void { this.inputText.content = `> ${"•".repeat(this.input.getValue().length)}`; }
}
