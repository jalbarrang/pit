import { BoxRenderable, type RenderContext, type Renderable } from "@opentui/core";
import { Component } from "./component.ts";

type SpacerLike = Renderable & { height: number; options?: Record<string, unknown> };

const createSpacerRenderable = (ctx: RenderContext, lines: number): SpacerLike =>
  new BoxRenderable(ctx, { width: "100%", height: lines, border: false }) as unknown as SpacerLike;

export class Spacer extends Component {
  readonly renderable: SpacerLike;
  private lines: number;

  constructor(ctx: RenderContext, lines = 1, renderable?: SpacerLike) {
    super();
    this.lines = lines;
    this.renderable = renderable ?? createSpacerRenderable(ctx, lines);
    this.applyLines();
  }

  setLines(lines: number): void {
    this.lines = Math.max(0, lines);
    this.applyLines();
    this.invalidate();
  }

  getLines(): number {
    return this.lines;
  }

  private applyLines(): void {
    this.renderable.height = this.lines;
    this.renderable.options = { ...this.renderable.options, height: this.lines };
  }
}
