import { TextRenderable, type RenderContext, type Renderable, type StyledText } from "@opentui/core";
import { Component } from "./component.ts";
import { textOptions, type PitStyle } from "./component-style.ts";

export type TextContent = string | StyledText;
type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

const createTextRenderable = (ctx: RenderContext, content: TextContent, paddingX: number, paddingY: number, style?: PitStyle): TextLike =>
  new TextRenderable(ctx, {
    content,
    paddingX,
    paddingY,
    width: "100%",
    height: "auto",
    wrapMode: "word",
    ...textOptions(style),
  }) as TextLike;

export class Text extends Component {
  readonly renderable: TextLike;
  private text: TextContent;

  constructor(ctx: RenderContext, content: TextContent = "", paddingX = 0, paddingY = 0, style?: PitStyle, renderable?: TextLike) {
    super();
    this.text = content;
    this.renderable = renderable ?? createTextRenderable(ctx, content, paddingX, paddingY, style);
    if (renderable) {
      renderable.content = content;
      renderable.options = { ...renderable.options, paddingX, paddingY, ...textOptions(style) };
    }
  }

  setText(text: TextContent): void {
    this.text = text;
    this.renderable.content = text;
    this.invalidate();
  }

  getText(): TextContent {
    return this.text;
  }
}
