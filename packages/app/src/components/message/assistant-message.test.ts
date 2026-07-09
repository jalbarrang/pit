import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import { AssistantMessageComponent } from "./assistant-message.ts";
import type { MarkdownPort } from "./markdown-port.ts";

const fakeMarkdown = (): MarkdownPort & { streaming: boolean } => {
  let text = "";
  return {
    renderable: {} as Renderable,
    streaming: false,
    setText(value) { text = value; },
    appendText(delta) { text += delta; },
    setStreaming(value) { this.streaming = value; },
    getText() { return text; },
  };
};

describe("AssistantMessageComponent", () => {
  it("streams markdown deltas then finalizes", () => {
    const markdown = fakeMarkdown();
    const component = new AssistantMessageComponent({} as never, "Hi", createTheme("dark"), markdown);
    component.append(" there");
    assert.equal(component.getText(), "Hi there");
    assert.equal(markdown.streaming, true);
    component.finalize();
    assert.equal(markdown.streaming, false);
  });

  it("sanitizes raw ANSI and kitty payloads before markdown", () => {
    const markdown = fakeMarkdown();
    const component = new AssistantMessageComponent({} as never, "plain ", createTheme("dark"), markdown);
    component.append("\x1b[31mred\x1b[0m \x1b_Gkitty\x1b\\tail");
    assert.equal(component.getText(), "plain red tail");
    assert.ok(!component.getText().includes("\x1b"));
    assert.ok(!component.getText().includes("kitty"));
  });
});
