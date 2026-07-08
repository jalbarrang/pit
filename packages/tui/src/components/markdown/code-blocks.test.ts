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

describe("Markdown code fences", () => {
  it("accepts known and unknown fence fixtures without changing text", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    const fixture = "```ts\nconst x = 1\n```\n\n```py\nprint(1)\n```\n\n```unknownlang\nplain\n```";
    const markdown = new Markdown({} as never, fixture, 0, 0, theme, undefined, undefined, box as never, md as never);
    assert.equal(markdown.getText(), fixture);
    assert.match(md.content, /```ts/);
    assert.match(md.content, /```py/);
    assert.match(md.content, /```unknownlang/);
  });
});
