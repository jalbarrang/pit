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
  getChildrenCount(): number { return this.children.length; }
  requestRender(): void { this.renderRequests++; }
}

const fake = () => new FakeRenderable() as never;
const theme: MarkdownTheme = {
  heading: { fg: "#88C0D0", bold: true },
  link: { underline: true },
  linkUrl: { underline: true },
  code: { fg: "#A3BE8C" },
  codeBlock: { fg: "#A3BE8C" },
  codeBlockBorder: { fg: "#4C566A" },
  quote: { italic: true },
  quoteBorder: { fg: "#4C566A" },
  hr: { fg: "#4C566A" },
  listBullet: { fg: "#B48EAD" },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
};

describe("Markdown streaming setText", () => {
  it("reports domain cache hits when only the tail block grows", () => {
    const box = fake() as FakeRenderable;
    const md = fake() as FakeRenderable;
    const markdown = new Markdown({} as never, "# T\n\na", 0, 0, theme, undefined, undefined, box as never, md as never);
    markdown.setStreaming(true);
    markdown.setText("# T\n\nab");
    assert.equal(markdown.lastStreamCacheHit(), true);
    assert.equal(md.content, "# T\n\nab");
    markdown.setText("# T\n\nab\n\nc");
    assert.equal(markdown.lastStreamCacheHit(), false);
  });
});
