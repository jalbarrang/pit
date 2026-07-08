import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Markdown } from "./markdown.ts";
import type { MarkdownTheme } from "./theme.ts";

class FakeRenderable {
  children: Renderable[] = [];
  content = "";
  streaming = false;
  options: Record<string, unknown> = {};
  syntaxStyles: Record<string, unknown> = {};
  renderRequests = 0;
  constructor(options: Record<string, unknown> = {}) { this.options = options; }
  add(child: Renderable): number { this.children.push(child); return this.children.length - 1; }
  remove(child: Renderable): void { this.children = this.children.filter((item) => item !== child); }
  getChildren(): Renderable[] { return this.children; }
  getChildrenCount(): number { return this.children.length; }
  requestRender(): void { this.renderRequests++; }
}

const fake = (options: Record<string, unknown> = {}) => new FakeRenderable(options) as never;
const theme: MarkdownTheme = {
  heading: { fg: "#88C0D0", bold: true },
  link: { fg: "#81A1C1", underline: true },
  linkUrl: { fg: "#88C0D0", underline: true },
  code: { fg: "#A3BE8C" },
  codeBlock: { fg: "#A3BE8C" },
  codeBlockBorder: { fg: "#4C566A" },
  quote: { fg: "#D08770", italic: true },
  quoteBorder: { fg: "#4C566A" },
  hr: { fg: "#4C566A" },
  listBullet: { fg: "#B48EAD" },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
};

describe("Markdown component", () => {
  it("applies padding on the box and mounts markdown content", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    new Markdown({} as never, "# Hi", 2, 1, theme, undefined, undefined, box as never, md as never);
    assert.equal(box.options.paddingX, 2);
    assert.equal(box.options.paddingY, 1);
    assert.equal(md.content, "# Hi");
    assert.equal(box.getChildrenCount(), 1);
  });

  it("updates content through setText and appendText", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    const markdown = new Markdown({} as never, "a", 0, 0, theme, undefined, undefined, box as never, md as never);
    markdown.setText("# Title");
    assert.equal(md.content, "# Title");
    markdown.appendText("\n- item");
    assert.equal(md.content, "# Title\n- item");
    assert.equal(markdown.getText(), "# Title\n- item");
  });

  it("toggles streaming on the inner markdown renderable", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    const markdown = new Markdown({} as never, "x", 0, 0, theme, undefined, undefined, box as never, md as never);
    markdown.setStreaming(true);
    assert.equal(md.streaming, true);
    assert.equal(markdown.isStreaming(), true);
    markdown.setStreaming(false);
    assert.equal(md.streaming, false);
  });

  it("keeps heading list and code fixture text intact for structure asserts", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    const fixture = "# Heading\n\n- alpha\n- beta\n\n```ts\nconst x = 1\n```";
    const markdown = new Markdown({} as never, fixture, 0, 0, theme, undefined, undefined, box as never, md as never);
    assert.equal(md.content, fixture);
    assert.match(markdown.getText(), /^# Heading/);
    assert.match(markdown.getText(), /- alpha/);
    assert.match(markdown.getText(), /```ts/);
  });
});
