import { TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";
import { truncateToWidth } from "../domain/styling/index.ts";
import { Component } from "./component.ts";
import { textOptions, type PitStyle } from "./component-style.ts";

export type TruncatedTextContent = string | StyledText;
type TextLike = Renderable & { content: string | StyledText; width?: number; options?: Record<string, unknown> };

const plain = (content: TruncatedTextContent): string => typeof content === "string" ? content : content.chunks.map((chunk) => chunk.text).join("");

const createRenderable = (ctx: RenderContext, content: string, paddingX: number, paddingY: number, style?: PitStyle): TextLike =>
  new TextRenderable(ctx, {
    content,
    paddingX,
    paddingY,
    height: 1 + paddingY * 2,
    wrapMode: "none",
    truncate: true,
    ...textOptions(style),
  }) as TextLike;

export class TruncatedText extends Component {
  readonly renderable: TextLike;
  private width = 80;
  private content: TruncatedTextContent;
  private paddingX: number;
  private paddingY: number;
  constructor(ctx: RenderContext, content: TruncatedTextContent, paddingX = 0, paddingY = 0, style?: PitStyle, renderable?: TextLike) {
    super();
    this.content = content;
    this.paddingX = paddingX;
    this.paddingY = paddingY;
    this.renderable = renderable ?? createRenderable(ctx, "", paddingX, paddingY, style);
    this.renderable.options = { ...this.renderable.options, paddingX, paddingY, ...textOptions(style) };
    this.update();
  }

  setText(content: TruncatedTextContent): void {
    this.content = content;
    this.update();
  }

  setWidth(width: number): void {
    this.width = width;
    this.renderable.width = width;
    this.update();
  }

  private update(): void {
    const available = Math.max(1, this.width - this.paddingX * 2);
    const line = truncateToWidth(plain(this.content), available, "…", true);
    this.renderable.content = `${" ".repeat(this.paddingX)}${line}${" ".repeat(this.paddingX)}`;
    this.invalidate();
  }
}
