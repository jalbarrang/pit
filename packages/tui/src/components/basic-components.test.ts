import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Box, Spacer, Text, TruncatedText } from "./index.ts";

class FakeRenderable {
  children: Renderable[] = [];
  content = "";
  options: Record<string, unknown> = {};
  renderRequests = 0;
  constructor(options: Record<string, unknown> = {}) { this.options = options; }
  add(child: Renderable): number { this.children.push(child); return this.children.length - 1; }
  remove(child: Renderable): void { this.children = this.children.filter((item) => item !== child); }
  getChildren(): Renderable[] { return this.children; }
  getChildrenCount(): number { return this.children.length; }
  requestRender(): void { this.renderRequests++; }
}

const fake = (options: Record<string, unknown> = {}) => new FakeRenderable(options) as unknown as Renderable;

describe("basic components", () => {
  it("maps Box padding and background style to its renderable", () => {
    const renderable = fake() as Renderable & { options: Record<string, unknown> };
    const box = new Box({} as never, 2, 1, { bg: "#112233" }, renderable as never);
    box.addChild(new Spacer({} as never, 1, fake() as never));
    assert.equal(renderable.options.paddingX, 2);
    assert.equal(renderable.options.paddingY, 1);
    assert.equal(renderable.options.backgroundColor, "#112233");
    assert.equal(renderable.getChildrenCount(), 1);
  });

  it("updates Text content through setText", () => {
    const renderable = fake() as Renderable & { content: string };
    const text = new Text({} as never, "hello", 1, 0, undefined, renderable as never);
    text.setText("world");
    assert.equal(renderable.content, "world");
  });

  it("keeps Spacer as a fixed-height empty renderable", () => {
    const renderable = fake() as Renderable & { options: Record<string, unknown> };
    const spacer = new Spacer({} as never, 3, renderable as never);
    spacer.setLines(5);
    assert.equal(renderable.options.height, 5);
  });

  it("renders TruncatedText as the first line with ellipsis", () => {
    const renderable = fake() as Renderable & { content: string };
    const text = new TruncatedText({} as never, "abcdef\nignored", 1, 0, undefined, renderable as never);
    text.setWidth(6);
    assert.equal(renderable.content, " abc… ");
  });
});
