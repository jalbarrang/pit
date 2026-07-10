import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import type { PitTheme } from "../domain/theming/index.ts";
import { formatFooter, type FooterInfo } from "./footer-format.ts";

type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class FooterComponent extends Component {
  readonly renderable: TextLike;
  private readonly text: Text;
  private lastInfo: FooterInfo | null = null;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    this.text = new Text(ctx, "", 1, 0, { fg: theme.color("muted") }, renderable);
    this.renderable = this.text.renderable as TextLike;
  }

  update(info: FooterInfo): void {
    this.lastInfo = info;
    this.text.setText(formatFooter(info));
  }

  notice(text: string): void {
    this.text.setText(text);
  }

  clearNotice(): void {
    if (this.lastInfo === null) {
      this.text.setText("");
      return;
    }
    this.text.setText(formatFooter(this.lastInfo));
  }

  applyTheme(theme: PitTheme): void {
    this.renderable.options = { ...this.renderable.options, fg: theme.color("muted") };
  }
}
