import type { Renderable, RenderContext } from "@opentui/core";
import { Box, Component } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { createMarkdownPort, type MarkdownPort } from "./markdown-port.ts";

type BoxLike = Renderable & { add(child: Renderable): number; options?: Record<string, unknown> };

export class UserMessageComponent extends Component {
  readonly renderable: BoxLike;
  private readonly markdown: MarkdownPort;

  constructor(ctx: RenderContext, text: string, theme: PitTheme, box?: BoxLike, markdown?: MarkdownPort) {
    super();
    const shell = new Box(ctx, 1, 0, { bg: theme.color("userMessageBg") }, box as never);
    this.renderable = shell.renderable as BoxLike;
    this.markdown = markdown ?? createMarkdownPort(ctx, theme, text);
    if (markdown) markdown.setText(text);
    shell.addChild(this.markdown as never);
  }

  getText(): string {
    return this.markdown.getText();
  }
}
