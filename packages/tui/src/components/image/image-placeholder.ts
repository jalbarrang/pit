import { type RenderContext, type Renderable } from "@opentui/core";
import { formatImagePlaceholder, type ImageDimensions } from "../../domain/styling/index.ts";
import { Box } from "../box.ts";
import { Component } from "../component.ts";
import { Text } from "../text.ts";

export interface ImagePlaceholderOptions {
  mimeType: string;
  dimensions?: ImageDimensions;
  filename?: string;
  hint?: string;
  width?: number;
}

type BoxLike = Renderable & { add(child: Renderable): number; options?: Record<string, unknown> };

export class ImagePlaceholder extends Component {
  readonly renderable: BoxLike;
  private readonly box: Box;

  constructor(ctx: RenderContext, options: ImagePlaceholderOptions, renderable?: BoxLike) {
    super();
    this.box = new Box(ctx, 1, 0, { bg: "#18181b" }, renderable as never);
    this.renderable = this.box.renderable as BoxLike;
    for (const line of formatImagePlaceholder(options, options.width)) this.box.addChild(new Text(ctx, line, 0, 0, { fg: "#a7f3d0" }));
  }
}
