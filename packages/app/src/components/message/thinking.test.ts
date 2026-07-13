import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import { ThinkingComponent } from "./thinking.ts";

class FakeText {
  content = "";
  options: Record<string, unknown> = {};
  requestRender() {}
}
const fakeText = () => new FakeText() as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("ThinkingComponent", () => {
  it("aligns its empty state with transcript prose", () => {
    const renderable = fakeText();
    const component = new ThinkingComponent({} as never, createTheme("dark"), renderable);
    assert.equal(renderable.content, "");
    assert.equal(renderable.options.paddingX, 1);
    assert.equal(renderable.options.maxWidth, undefined);
    component.setExpanded(true);
    assert.equal(renderable.content, "");
  });

  it("stays collapsed on Thinking… after appendThinking", () => {
    const renderable = fakeText();
    const component = new ThinkingComponent({} as never, createTheme("dark"), renderable);
    component.appendThinking("abc");
    assert.equal(renderable.content, "Thinking…");
  });

  it("shows accumulated text when expanded and updates on further appends", () => {
    const renderable = fakeText();
    const component = new ThinkingComponent({} as never, createTheme("dark"), renderable);
    component.appendThinking("abc");
    component.setExpanded(true);
    assert.equal(renderable.content, "abc");
    component.appendThinking("def");
    assert.equal(renderable.content, "abcdef");
  });

  it("returns to Thinking… when collapsed again", () => {
    const renderable = fakeText();
    const component = new ThinkingComponent({} as never, createTheme("dark"), renderable);
    component.appendThinking("abc");
    component.setExpanded(true);
    component.setExpanded(false);
    assert.equal(renderable.content, "Thinking…");
  });

  it("setThinking replaces accumulated text", () => {
    const renderable = fakeText();
    const component = new ThinkingComponent({} as never, createTheme("dark"), renderable);
    component.appendThinking("abc");
    component.setThinking("xyz");
    component.setExpanded(true);
    assert.equal(renderable.content, "xyz");
  });
});
