import type { Renderable, RenderContext } from "@opentui/core";
import { Box, Component, Text, ansiTextToStyledText, formatImagePlaceholder, getImageDimensions, type TextContent } from "@pit/tui";
import { isDiffText, type ToolRun } from "../domain/index.ts";
import type { PitTheme } from "../domain/theming/index.ts";
import { DiffViewComponent, type DiffLineFactory } from "./diff-view.ts";
import { formatToolRun } from "./tool-format.ts";

type BoxLike = Renderable & { add(child: Renderable): number; onMouseDown?: (event: any) => void; options?: Record<string, unknown> };
type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };
type DiffInject = { box?: BoxLike; line?: DiffLineFactory; imageText?: () => TextLike };

export class ToolExecutionComponent extends Component {
  readonly renderable: BoxLike;
  private readonly shell: Box;
  private readonly text: Text;
  private diff?: DiffViewComponent;
  private readonly theme: PitTheme;
  private readonly ctx: RenderContext;
  private expanded = false;
  private run: ToolRun;
  private readonly diffInject?: DiffInject;

  constructor(ctx: RenderContext, run: ToolRun, theme: PitTheme, box?: BoxLike, textRenderable?: TextLike, diffInject?: DiffInject) {
    super();
    this.run = { ...run };
    this.theme = theme;
    this.ctx = ctx;
    this.diffInject = diffInject;
    this.shell = new Box(ctx, 1, 0, this.bg(), box as never);
    this.renderable = this.shell.renderable as BoxLike;
    this.text = new Text(ctx, formatToolRun(this.run), 0, 0, { fg: theme.color("toolOutput") }, textRenderable);
    this.renderable.onMouseDown = () => this.setExpanded(!this.expanded);
    this.renderBody(ctx);
  }

  update(run: ToolRun): void {
    this.run = { ...run };
    this.shell.setBackground(this.bg());
    this.renderBody(this.ctx);
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.renderBody(this.ctx);
  }

  getText(): TextContent {
    return this.text.getText();
  }

  // opentui renders escape bytes literally, so parse ANSI (and drop kitty/OSC
  // sequences) when tool output contains escapes; plain output stays a string.
  private display(text: string): TextContent {
    return text.includes("\x1b") ? ansiTextToStyledText(text) : text;
  }

  private renderBody(ctx: RenderContext): void {
    this.shell.clear();
    const diffText = this.diffText();
    if (!diffText) { this.text.setText(this.display(formatToolRun(this.run, this.expanded))); this.shell.addChild(this.text); this.renderImages(ctx); return; }
    this.text.setText(this.display(formatToolRun({ ...this.run, output: "" }, this.expanded)));
    this.shell.addChild(this.text);
    this.diff = new DiffViewComponent(ctx, diffText, this.theme, this.diffInject?.box, this.diffInject?.line);
    this.shell.addChild(this.diff);
    this.renderImages(ctx);
  }

  private renderImages(ctx: RenderContext): void {
    for (const image of this.run.images ?? []) {
      const lines = formatImagePlaceholder({ mimeType: image.mimeType, filename: image.filename, dimensions: getImageDimensions(image.data, image.mimeType) ?? undefined });
      this.shell.addChild(new Text(ctx, lines.join("\n"), 0, 0, { fg: this.theme.color("toolOutput") }, this.diffInject?.imageText?.()));
    }
  }

  private diffText(): string | undefined {
    return ["edit", "write"].includes(this.run.name) && isDiffText(this.run.output) ? this.run.output : undefined;
  }

  private bg() {
    if (this.run.status === "failed") return { bg: this.theme.color("toolErrorBg") };
    if (this.run.status === "succeeded") return { bg: this.theme.color("toolSuccessBg") };
    return { bg: this.theme.color("toolPendingBg") };
  }
}
