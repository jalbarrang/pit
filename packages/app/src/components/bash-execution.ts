import { StyledText, fg, type Renderable, type RenderContext, type TextChunk } from "@opentui/core";
import { Box, Component, Text, ansiTextToStyledText, type TextContent } from "@pit/tui";
import type { PitTheme } from "../domain/theming/index.ts";
import { bashOutputLines, formatBashHeader, formatBashStatus } from "./bash-format.ts";
import { spaceBelow } from "./message/spacing.ts"; import { treePrefix } from "./tool-format.ts";

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
    this.shell = new Box(ctx, 1, 0, undefined, box as never);
    this.renderable = this.shell.renderable as BoxLike;
    spaceBelow(this.renderable);
    this.text = new Text(ctx, this.body(), 0, 0, undefined, textRenderable);
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

  private body(): StyledText {
    const header = formatBashHeader(this.command, this.excluded);
    const command = header.slice("⚙ bash ".length);
    const chunks: TextChunk[] = [
      fg(this.theme.color("toolGlyph"))("⚙"),
      fg(this.theme.color("toolTitle"))(" bash "),
      fg(this.theme.color("toolOutput"))(command),
    ];
    const lines = bashOutputLines(this.output, this.expanded);
    lines.forEach((line, index) => {
      chunks.push({ __isChunk: true, text: "\n  " });
      const lastContinuesToStatus = index === lines.length - 1 && (this.cancelled || this.exitCode !== undefined && this.exitCode !== null);
      chunks.push(fg(this.theme.color("connector"))(lastContinuesToStatus ? "│" : treePrefix(index, lines.length)));
      chunks.push({ __isChunk: true, text: " " });
      chunks.push(...this.outputChunks(line));
    });
    return new StyledText(chunks);
  }

  private outputChunks(line: string): TextChunk[] {
    if (line.startsWith("… ") && line.includes(" · ctrl+o to expand")) {
      const [summary, hint = ""] = line.split("ctrl+o", 2);
      return [
        fg(this.theme.color("toolOutput"))(summary),
        fg(this.theme.color("expandHint"))("ctrl+o"),
        fg(this.theme.color("toolOutput"))(hint),
      ];
    }
    if (line.includes("\x1b")) return ansiTextToStyledText(line).chunks;
    return [fg(this.theme.color("toolOutput"))(line)];
  }

  private renderBody(): void {
    this.shell.clear();
    this.text.setText(this.body());
    this.shell.addChild(this.text);
    const status = formatBashStatus(this.exitCode, this.cancelled);
    if (!status) return;
    const failed = status.startsWith("✗");
    this.shell.addChild(new Text(this.ctx, `  ⎿ ${status}`, 0, 0, { fg: this.theme.color(failed ? "error" : "success") }, this.statusRenderable));
  }
}
