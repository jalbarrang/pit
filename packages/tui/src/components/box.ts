import { BoxRenderable, type RenderContext } from "@opentui/core";
import { Container } from "./container.ts";
import type { PitStyle } from "./component-style.ts";

export type BoxStyle = Pick<PitStyle, "bg">;
type BoxLike = BoxRenderable & { options?: Record<string, unknown> };

const createBoxRenderable = (ctx: RenderContext, paddingX: number, paddingY: number, style?: BoxStyle): BoxLike =>
  new BoxRenderable(ctx, {
    flexDirection: "column",
    width: "100%",
    height: "auto",
    border: false,
    paddingX,
    paddingY,
    backgroundColor: style?.bg,
  }) as BoxLike;

export class Box extends Container {
  declare readonly renderable: BoxLike;
  constructor(ctx: RenderContext, paddingX = 0, paddingY = 0, style?: BoxStyle, renderable?: BoxLike) {
    const box = renderable ?? createBoxRenderable(ctx, paddingX, paddingY, style);
    if (renderable) {
      renderable.options = { ...renderable.options, paddingX, paddingY, backgroundColor: style?.bg };
    }
    super(ctx, box);
  }

  setBackground(style?: BoxStyle): void {
    if (style?.bg !== undefined) this.renderable.backgroundColor = style.bg as never;
    this.renderable.options = { ...this.renderable.options, backgroundColor: style?.bg };
    this.invalidate();
  }
}
