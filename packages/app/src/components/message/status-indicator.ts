import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { TRANSCRIPT_GUTTER } from "./spacing.ts";

type TextLike = Renderable & { content: string; fg?: unknown; options?: Record<string, unknown> };

export class StatusIndicator extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;

  constructor(ctx: RenderContext, theme: PitTheme, label = "thinking…", renderable?: TextLike) {
    super();
    this.text = new Text(ctx, this.display(label), TRANSCRIPT_GUTTER, 0, { fg: theme.color("brand") }, renderable);
    this.renderable = this.text.renderable as TextLike;
  }

  setLabel(label: string): void {
    this.text.setText(this.display(label));
  }

  applyTheme(theme: PitTheme): void {
    this.renderable.fg = theme.color("brand");
    this.renderable.options = { ...this.renderable.options, fg: theme.color("brand") };
  }

  private display(label: string): string {
    return label ? `⠸ ${label}` : "";
  }
}
