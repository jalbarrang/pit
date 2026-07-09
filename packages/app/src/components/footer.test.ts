import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import type { TextContent } from "@pit/tui";
import { createTheme } from "../domain/theming/index.ts";
import { formatCwd, formatFooter, formatTokens } from "./footer-format.ts";
import { FooterComponent } from "./footer.ts";

class FakeText { content = ""; options: Record<string, unknown> = {}; requestRender() {} }
const fakeText = () =>
  new FakeText() as unknown as Renderable & { content: TextContent; options?: Record<string, unknown> };

const tokens = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 10 };

describe("footer formatting", () => {
  it("compacts the home directory", () => {
    assert.equal(formatCwd("/Users/me/project", "/Users/me"), "~/project");
  });

  it("shows cwd, model, and token usage", () => {
    const text = formatFooter("/repo", "anthropic/model", { input: 1, output: 2, cacheRead: 3, cacheWrite: 4, total: 10 });
    assert.equal(text, "/repo  │  anthropic/model  │  10 tok");
    assert.equal(formatTokens({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }), "0 tok");
  });
});

describe("FooterComponent notice", () => {
  it("shows a transient notice over the footer", () => {
    const renderable = fakeText();
    const footer = new FooterComponent({} as never, createTheme("dark"), renderable);
    footer.update("/repo", "anthropic/model", tokens);
    footer.notice("Copied 2 lines");
    assert.equal(renderable.content, "Copied 2 lines");
  });

  it("restores the last footer after clearNotice", () => {
    const renderable = fakeText();
    const footer = new FooterComponent({} as never, createTheme("dark"), renderable);
    footer.update("/repo", "anthropic/model", tokens);
    const expected = formatFooter("/repo", "anthropic/model", tokens);
    footer.notice("Copied 2 lines");
    footer.clearNotice();
    assert.equal(renderable.content, expected);
  });

  it("clearNotice before update restores empty string", () => {
    const renderable = fakeText();
    const footer = new FooterComponent({} as never, createTheme("dark"), renderable);
    footer.notice("Copied 2 lines");
    footer.clearNotice();
    assert.equal(renderable.content, "");
  });
});
