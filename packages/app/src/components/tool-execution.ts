import type { Renderable, RenderContext } from "@opentui/core";
import { Box, Component, Text, type TextContent } from "@pit/tui";
import type { ToolRun } from "../domain/index.ts";
import type { PitTheme } from "../domain/theming/index.ts";
import { formatToolRun } from "./tool-format.ts";

type BoxLike = Renderable & { add(child: Renderable): number; options?: Record<string, unknown> };
type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class ToolExecutionComponent extends Component {
  readonly renderable: BoxLike;
  private readonly shell: Box;
  private readonly text: Text;
  private readonly theme: PitTheme;
  private expanded = false;
  private run: ToolRun;

  constructor(ctx: RenderContext, run: ToolRun, theme: PitTheme, box?: BoxLike, textRenderable?: TextLike) {
    super();
    this.run = { ...run };
    this.theme = theme;
    this.shell = new Box(ctx, 1, 0, this.bg(), box as never);
    this.renderable = this.shell.renderable as BoxLike;
    this.text = new Text(ctx, formatToolRun(this.run), 0, 0, { fg: theme.color("toolOutput") }, textRenderable);
    this.shell.addChild(this.text);
  }

  update(run: ToolRun): void {
    this.run = { ...run };
    this.shell.setBackground(this.bg());
    this.text.setText(formatToolRun(this.run, this.expanded));
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.text.setText(formatToolRun(this.run, expanded));
  }

  getText(): TextContent {
    return this.text.getText();
  }

  private bg() {
    if (this.run.status === "failed") return { bg: this.theme.color("toolErrorBg") };
    if (this.run.status === "succeeded") return { bg: this.theme.color("toolSuccessBg") };
    return { bg: this.theme.color("toolPendingBg") };
  }
}
