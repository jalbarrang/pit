import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";

type TextLike = Renderable & { content: string; options?: Record<string, unknown> };

export class StatusIndicator extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;

  constructor(ctx: RenderContext, theme: PitTheme, label = "thinking…", renderable?: TextLike) {
    super();
    this.text = new Text(ctx, label, 1, 0, { fg: theme.color("thinkingText") }, renderable);
    this.renderable = this.text.renderable as TextLike;
  }

  setLabel(label: string): void {
    this.text.setText(label);
  }
}
