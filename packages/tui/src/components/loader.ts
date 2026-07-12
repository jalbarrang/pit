import { TextRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Component } from "./component.ts";
import { textOptions, type PitStyle } from "./component-style.ts";

export interface LoaderIndicatorOptions { frames?: string[]; intervalMs?: number }
const DEFAULT_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const DEFAULT_INTERVAL_MS = 80;
const DEFAULT_SPINNER_STYLE: PitStyle = { fg: "#ff5f87" };
type TextLike = Renderable & { content: string; fg?: unknown; options?: Record<string, unknown> };
const createRenderable = (ctx: RenderContext, style?: PitStyle): TextLike =>
  new TextRenderable(ctx, { content: "", height: 1, wrapMode: "none", ...textOptions(style) }) as unknown as TextLike;

export class Loader extends Component {
  readonly renderable: TextLike;
  private frames: string[];
  private intervalMs: number;
  private currentFrame = 0;
  private timer: ReturnType<typeof setInterval> | null = null;
  private message: string;
  private spinnerStyle?: PitStyle;
  private messageStyle?: PitStyle;
  private requestRender?: () => void;
  constructor(
    ctx: RenderContext,
    spinnerStyle?: PitStyle,
    messageStyle?: PitStyle,
    message = "Loading...",
    indicator?: LoaderIndicatorOptions,
    renderable?: TextLike,
    requestRender?: () => void,
  ) {
    super();
    this.spinnerStyle = spinnerStyle ?? DEFAULT_SPINNER_STYLE;
    this.messageStyle = messageStyle;
    this.requestRender = requestRender;
    this.renderable = renderable ?? createRenderable(ctx, messageStyle);
    this.message = message;
    this.frames = indicator?.frames ?? DEFAULT_FRAMES;
    this.intervalMs = indicator?.intervalMs && indicator.intervalMs > 0 ? indicator.intervalMs : DEFAULT_INTERVAL_MS;
    this.updateDisplay();
  }

  start(): void {
    this.stop();
    this.updateDisplay();
    if (this.frames.length <= 1) return;
    this.timer = setInterval(() => this.advance(), this.intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  setMessage(message: string): void {
    this.message = message;
    this.updateDisplay();
  }

  get running(): boolean { return this.timer !== null; }

  protected advance(): void {
    this.currentFrame = (this.currentFrame + 1) % Math.max(1, this.frames.length);
    this.updateDisplay();
  }

  private updateDisplay(): void {
    const frame = this.frames[this.currentFrame] ?? "";
    const gap = frame ? " " : "";
    this.renderable.content = `${frame}${gap}${this.message}`;
    this.renderable.fg = this.spinnerStyle?.fg;
    this.renderable.options = { ...this.renderable.options, fg: this.spinnerStyle?.fg, spinnerStyle: this.spinnerStyle, messageStyle: this.messageStyle };
    this.requestRender?.();
    this.invalidate();
  }
}
