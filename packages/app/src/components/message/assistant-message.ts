import type { RenderContext, Renderable } from "@opentui/core";
import { Component } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { sanitizeMessageText } from "./escape-sanitize.ts";
import { createMarkdownPort, type MarkdownPort } from "./markdown-port.ts";
import { spaceBelow } from "./spacing.ts";

export class AssistantMessageComponent extends Component {
  readonly renderable: Renderable;
  private readonly markdown: MarkdownPort;
  private rawText: string;

  constructor(ctx: RenderContext, text: string, theme: PitTheme, markdown?: MarkdownPort) {
    super();
    this.rawText = text;
    this.markdown = markdown ?? createMarkdownPort(ctx, theme, sanitizeMessageText(text));
    this.markdown.setText(sanitizeMessageText(text));
    this.markdown.setStreaming(true);
    this.renderable = this.markdown.renderable;
    this.syncMargin();
  }

  append(delta: string): void {
    this.rawText += delta;
    this.markdown.setText(sanitizeMessageText(this.rawText));
    this.syncMargin();
  }

  setText(text: string): void {
    this.rawText = text;
    this.markdown.setText(sanitizeMessageText(text));
    this.syncMargin();
  }

  // Tool-only assistant turns have no text; they must not add a blank row.
  private syncMargin(): void {
    spaceBelow(this.renderable, this.rawText.trim() ? 1 : 0);
  }

  finalize(): void {
    this.markdown.setStreaming(false);
  }

  getText(): string {
    return this.markdown.getText();
  }
}
