import type { RenderContext, Renderable } from "@opentui/core";
import { Markdown } from "@pit/tui";
import { getDefaultTextStyle, getMarkdownTheme, type PitTheme } from "../../domain/theming/index.ts";
import { TRANSCRIPT_GUTTER } from "./spacing.ts";

export interface MarkdownPort {
  renderable: Renderable;
  setText(text: string): void;
  appendText(delta: string): void;
  setStreaming(streaming: boolean): void;
  getText(): string;
}

export const createMarkdownPort = (ctx: RenderContext, theme: PitTheme, text: string): MarkdownPort => {
  return new Markdown(ctx, text, TRANSCRIPT_GUTTER, 0, getMarkdownTheme(theme), getDefaultTextStyle(theme));
};
