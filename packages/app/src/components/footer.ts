import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import type { TokenUsage } from "../domain/index.ts";
import type { PitTheme } from "../domain/theming/index.ts";
import { formatFooter } from "./footer-format.ts";

type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class FooterComponent extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;
  private lastCwd = "";
  private lastModelId = "";
  private lastTokens: TokenUsage | null = null;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    this.text = new Text(ctx, "", 1, 0, { fg: theme.color("muted") }, renderable);
    this.renderable = this.text.renderable as TextLike;
  }

  update(cwd: string, modelId: string, tokens: TokenUsage): void {
    this.lastCwd = cwd;
    this.lastModelId = modelId;
    this.lastTokens = tokens;
    this.text.setText(formatFooter(cwd, modelId, tokens));
  }

  notice(text: string): void {
    this.text.setText(text);
  }

  clearNotice(): void {
    if (this.lastTokens === null) {
      this.text.setText("");
      return;
    }
    this.text.setText(formatFooter(this.lastCwd, this.lastModelId, this.lastTokens));
  }

  applyTheme(theme: PitTheme): void {
    this.renderable.options = { ...this.renderable.options, fg: theme.color("muted") };
  }
}
