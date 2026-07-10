import type { Renderable, RenderContext } from "@opentui/core";
import { Box, Component, Text, type TextContent } from "@pit/tui";
import type { PitTheme } from "../domain/theming/index.ts";
import { formatBashHeader, formatBashOutput, formatBashStatus } from "./bash-format.ts";

type BoxLike = Renderable & { add(child: Renderable): number; onMouseDown?: (event: any) => void; options?: Record<string, unknown> };
type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class BashExecutionComponent extends Component {
  readonly renderable: BoxLike;
  private readonly shell: Box;
  private readonly text: Text;
  private readonly ctx: RenderContext;
  private readonly theme: PitTheme;
  private readonly statusRenderable?: TextLike;
  private readonly command: string;
  private readonly excluded: boolean;
  private expanded = false;
  private output = "";
  private exitCode: number | null | undefined;
  private cancelled = false;

  constructor(ctx: RenderContext, command: string, excluded: boolean, theme: PitTheme, box?: BoxLike, textRenderable?: TextLike, statusRenderable?: TextLike) {
    super();
    this.ctx = ctx;
    this.theme = theme;
    this.statusRenderable = statusRenderable;
    this.command = command;
    this.excluded = excluded;
    this.shell = new Box(ctx, 1, 0, {}, box as never);
    this.renderable = this.shell.renderable as BoxLike;
    this.text = new Text(ctx, this.body(), 0, 0, { fg: theme.color("toolOutput") }, textRenderable);
    this.renderable.onMouseDown = () => this.setExpanded(!this.expanded);
    this.renderBody();
  }

  appendOutput(chunk: string): void {
    this.output += chunk;
    this.renderBody();
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.renderBody();
  }

  setComplete(exitCode: number | null | undefined, cancelled: boolean): void {
    this.exitCode = exitCode;
    this.cancelled = cancelled;
    this.renderBody();
  }

  getText(): TextContent {
    return this.text.getText();
  }

  private body(): string {
    return [formatBashHeader(this.command, this.excluded), formatBashOutput(this.output, this.expanded)]
      .filter(Boolean)
      .join("\n");
  }

  private renderBody(): void {
    this.shell.clear();
    this.text.setText(this.body());
    this.shell.addChild(this.text);
    const status = formatBashStatus(this.exitCode, this.cancelled);
    if (!status) return;
    this.shell.addChild(new Text(this.ctx, status, 0, 0, { fg: this.theme.color("error") }, this.statusRenderable));
  }
}
