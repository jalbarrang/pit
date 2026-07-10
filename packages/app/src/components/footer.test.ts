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
const base = { cwd: "/repo", modelId: "anthropic/model", tokens };

describe("footer formatting", () => {
  it("compacts the home directory", () => {
    assert.equal(formatCwd("/Users/me/project", "/Users/me"), "~/project");
  });

  it("shows required segments only", () => {
    const text = formatFooter(base);
    assert.equal(text, "/repo  │  anthropic/model  │  10 tok");
    assert.equal(formatTokens({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }), "0 tok");
  });

  it("includes all optional segments when present", () => {
    const text = formatFooter({
      ...base,
      branch: "main",
      sessionName: "my-session",
      thinking: "high",
      contextPercent: 12.5,
      contextWindow: 200_000,
    });
    assert.equal(
      text,
      "/repo  │  main  │  my-session  │  anthropic/model  │  high  │  10 tok  │  ctx 13% of 200k",
    );
  });

  it("shows context percent without window", () => {
    assert.equal(
      formatFooter({ ...base, contextPercent: 12.4 }),
      "/repo  │  anthropic/model  │  10 tok  │  ctx 12%",
    );
  });

  it("omits empty optional segments", () => {
    assert.equal(
      formatFooter({ ...base, branch: "", sessionName: undefined, thinking: "" }),
      "/repo  │  anthropic/model  │  10 tok",
    );
  });
});

describe("FooterComponent notice", () => {
  it("shows a transient notice over the footer", () => {
    const renderable = fakeText();
    const footer = new FooterComponent({} as never, createTheme("dark"), renderable);
    footer.update(base);
    footer.notice("Copied 2 lines");
    assert.equal(renderable.content, "Copied 2 lines");
  });

  it("restores the last footer after clearNotice", () => {
    const renderable = fakeText();
    const footer = new FooterComponent({} as never, createTheme("dark"), renderable);
    const info = { ...base, branch: "main", thinking: "high" };
    footer.update(info);
    const expected = formatFooter(info);
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
