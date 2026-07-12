import { StyledText, bold, fg, type Renderable, type RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import { version } from "../domain/release-info.ts";
import type { PitTheme } from "../domain/theming/index.ts";

type TextLike = Renderable & { content: TextContent; options?: Record<string, unknown> };

export class GreetingComponent extends Component {
  readonly renderable: TextLike;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    const content = new StyledText([
      bold(fg(theme.color("brand"))("pit")),
      fg(theme.color("muted"))(` v${version} · pi agent · /help for commands`),
    ]);
    const text = new Text(ctx, content, 1, 0, undefined, renderable);
    this.renderable = text.renderable as TextLike;
  }
}
