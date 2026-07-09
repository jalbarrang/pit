import type { RenderContext, Renderable } from "@opentui/core";
import { Markdown } from "@pit/tui";
import { getDefaultTextStyle, getMarkdownTheme, type PitTheme } from "../../domain/theming/index.ts";

export interface MarkdownPort {
  renderable: Renderable;
  setText(text: string): void;
  appendText(delta: string): void;
  setStreaming(streaming: boolean): void;
  getText(): string;
}

export const createMarkdownPort = (ctx: RenderContext, theme: PitTheme, text: string): MarkdownPort =>
  new Markdown(ctx, text, 1, 0, getMarkdownTheme(theme), getDefaultTextStyle(theme));
