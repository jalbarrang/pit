import type { RenderContext, Renderable } from "@opentui/core";
import { Box, Component, Text } from "@pit/tui";
import { classifyDiffLines, type DiffLineKind } from "../domain/conversation/index.ts";
import type { PitTheme } from "../domain/theming/index.ts";

type BoxLike = Renderable & { add(child: Renderable): number; options?: Record<string, unknown> };
export type DiffLineFactory = (ctx: RenderContext, text: string, color: string) => Text;

export class DiffViewComponent extends Component {
  readonly renderable: BoxLike;
  private readonly box: Box;
  private readonly theme: PitTheme;
  private readonly ctx: RenderContext;
  private readonly makeLine?: DiffLineFactory;

  constructor(ctx: RenderContext, diffText: string, theme: PitTheme, box?: BoxLike, makeLine?: DiffLineFactory) {
    super();
    this.theme = theme;
    this.ctx = ctx;
    this.makeLine = makeLine;
    this.box = new Box(ctx, 0, 0, undefined, box as never);
    this.renderable = this.box.renderable as BoxLike;
    this.setDiff(diffText);
  }

  setDiff(diffText: string): void {
    this.box.clear();
    for (const line of classifyDiffLines(diffText)) {
      const color = this.color(line.kind);
      this.box.addChild(this.makeLine?.(this.ctx, line.text, color) ?? new Text(this.ctx, line.text, 0, 0, { fg: color }));
    }
  }

  private color(kind: DiffLineKind): string {
    if (kind === "added") return this.theme.color("toolDiffAdded");
    if (kind === "removed") return this.theme.color("toolDiffRemoved");
    return this.theme.color("toolDiffContext");
  }
}
