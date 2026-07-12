import { BorderChars, type BorderCharacters, type Renderable, type RenderContext } from "@opentui/core";
import { Box, Component } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { sanitizeMessageText } from "./escape-sanitize.ts";
import { spaceBelow } from "./spacing.ts";
import { createMarkdownPort, type MarkdownPort } from "./markdown-port.ts";

type BoxLike = Renderable & {
  add(child: Renderable): number;
  border?: boolean | Array<"top" | "right" | "bottom" | "left">;
  borderColor?: unknown;
  customBorderChars?: BorderCharacters;
  options?: Record<string, unknown>;
};

// A solid block instead of the default thin `│` so the spine reads as a bar.
const spineChars: BorderCharacters = { ...BorderChars.single, vertical: "█" };

export class UserMessageComponent extends Component {
  readonly renderable: BoxLike;
  private readonly markdown: MarkdownPort;

  constructor(ctx: RenderContext, text: string, theme: PitTheme, box?: BoxLike, markdown?: MarkdownPort) {
    super();
    const shell = new Box(ctx, 2, 1, { bg: theme.color("userMessageBg") }, box as never);
    this.renderable = shell.renderable as BoxLike;
    this.renderable.border = ["left"];
    this.renderable.borderColor = theme.color("interactive");
    this.renderable.customBorderChars = spineChars;
    this.renderable.options = {
      ...this.renderable.options,
      border: ["left"],
      borderColor: theme.color("interactive"),
      customBorderChars: spineChars,
    };
    spaceBelow(this.renderable);
    const safeText = sanitizeMessageText(text);
    this.markdown = markdown ?? createMarkdownPort(ctx, theme, safeText);
    this.markdown.setText(safeText);
    shell.addChild(this.markdown as never);
  }

  getText(): string {
    return this.markdown.getText();
  }
}
