import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { spaceBelow, TRANSCRIPT_GUTTER } from "./spacing.ts";

type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

const LABEL = "Thinking…";

export class ThinkingComponent extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;
  private thinking = "";
  private expanded = false;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    this.text = new Text(ctx, "", TRANSCRIPT_GUTTER, 0, { fg: theme.color("muted"), italic: true }, renderable);
    this.renderable = this.text.renderable as TextLike;
  }

  appendThinking(delta: string): void {
    this.thinking += delta;
    this.render();
  }

  setThinking(text: string): void {
    this.thinking = text;
    this.render();
  }

  setExpanded(expanded: boolean): void {
    this.expanded = expanded;
    this.render();
  }

  private render(): void {
    this.text.setText(!this.thinking ? "" : this.expanded ? this.thinking : LABEL);
    // No margin while empty so a hidden thinking block leaves no stray gap.
    spaceBelow(this.renderable, this.thinking ? 1 : 0);
  }
}
