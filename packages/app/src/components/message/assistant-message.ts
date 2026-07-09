import type { RenderContext, Renderable } from "@opentui/core";
import { Component } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { sanitizeMessageText } from "./escape-sanitize.ts";
import { createMarkdownPort, type MarkdownPort } from "./markdown-port.ts";

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
  }

  append(delta: string): void {
    this.rawText += delta;
    this.markdown.setText(sanitizeMessageText(this.rawText));
  }

  setText(text: string): void {
    this.rawText = text;
    this.markdown.setText(sanitizeMessageText(text));
  }

  finalize(): void {
    this.markdown.setStreaming(false);
  }

  getText(): string {
    return this.markdown.getText();
  }
}
