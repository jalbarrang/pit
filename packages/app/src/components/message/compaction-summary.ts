import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { spaceBelow } from "./spacing.ts";

type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class CompactionSummaryComponent extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;
  private summary = "";
  private tokensBefore = 0;
  private tokensAfter?: number;
  private ready = false;
  private expanded = false;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    this.text = new Text(ctx, "", 0, 0, { fg: theme.color("muted"), italic: true }, renderable);
    this.renderable = this.text.renderable as TextLike;
    spaceBelow(this.renderable);
  }

  setSummary(summary: string, tokensBefore: number, tokensAfter?: number): void {
    this.summary = summary;
    this.tokensBefore = tokensBefore;
    this.tokensAfter = tokensAfter;
    this.ready = true;
    this.render();
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.render();
  }

  private render(): void {
    if (!this.ready) {
      this.text.setText("");
      return;
    }
    if (this.expanded) {
      this.text.setText(this.summary);
      return;
    }
    const range = this.tokensAfter === undefined
      ? `${this.tokensBefore} tokens`
      : `${this.tokensBefore}→${this.tokensAfter} tokens`;
    this.text.setText(`Compaction summary (${range})`);
  }
}
