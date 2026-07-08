import type { Renderable, RenderContext } from "@opentui/core";
import { Component } from "../component.ts";
import { createBox, createMarkdown, type MarkdownLike } from "./create-renderables.ts";
import type { DefaultTextStyle, MarkdownOptions, MarkdownTheme } from "./theme.ts";

type BoxLike = Renderable & { options?: Record<string, unknown> };

export class Markdown extends Component {
  readonly renderable: BoxLike;
  private readonly markdown: MarkdownLike;
  private text: string;
  private streaming = false;

  constructor(
    ctx: RenderContext,
    text: string,
    paddingX = 0,
    paddingY = 0,
    theme: MarkdownTheme,
    defaultTextStyle?: DefaultTextStyle,
    _options?: MarkdownOptions,
    box?: BoxLike,
    markdownRenderable?: MarkdownLike,
  ) {
    super();
    this.text = text;
    this.renderable = box ?? (createBox(ctx, paddingX, paddingY) as BoxLike);
    if (box) this.renderable.options = { ...box.options, paddingX, paddingY };
    this.markdown = markdownRenderable ?? createMarkdown(ctx, text, theme, defaultTextStyle);
    if (markdownRenderable) this.markdown.content = text;
    this.renderable.add(this.markdown as never);
  }

  setText(text: string): void {
    this.text = text;
    this.markdown.content = text;
    this.invalidate();
  }

  appendText(delta: string): void {
    this.setText(this.text + delta);
  }

  getText(): string {
    return this.text;
  }

  setStreaming(streaming: boolean): void {
    this.streaming = streaming;
    if (this.markdown.streaming !== undefined) this.markdown.streaming = streaming;
    this.invalidate();
  }

  isStreaming(): boolean {
    return this.streaming;
  }
}
