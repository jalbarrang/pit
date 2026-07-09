import type { RenderContext, Renderable } from "@opentui/core";
import { Component } from "@pit/tui";
import type { PitTheme } from "../../domain/theming/index.ts";
import { createMarkdownPort, type MarkdownPort } from "./markdown-port.ts";

export class AssistantMessageComponent extends Component {
  readonly renderable: Renderable;
  private readonly markdown: MarkdownPort;

  constructor(ctx: RenderContext, text: string, theme: PitTheme, markdown?: MarkdownPort) {
    super();
    this.markdown = markdown ?? createMarkdownPort(ctx, theme, text);
    this.markdown.setText(text);
    this.markdown.setStreaming(true);
    this.renderable = this.markdown.renderable;
  }

  append(delta: string): void {
    this.markdown.appendText(delta);
  }

  setText(text: string): void {
    this.markdown.setText(text);
  }

  finalize(): void {
    this.markdown.setStreaming(false);
  }

  getText(): string {
    return this.markdown.getText();
  }
}
