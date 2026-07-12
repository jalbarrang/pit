import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import { StatusIndicator } from "./status-indicator.ts";

class FakeText { content = ""; options: Record<string, unknown> = {}; requestRender() {} }

describe("StatusIndicator", () => {
  it("renders running work with a brand-colored spinner", () => {
    const renderable = new FakeText() as unknown as Renderable & { content: string; options: Record<string, unknown> };
    const status = new StatusIndicator({} as never, createTheme("dark"), "working", renderable);
    assert.equal(renderable.content, "⠸ working");
    assert.equal(renderable.options.fg, "#ff5f87");
    status.applyTheme(createTheme("light"));
    assert.equal((renderable as typeof renderable & { fg?: unknown }).fg, "#d63864");
    status.setLabel("");
    assert.equal(renderable.content, "");
  });
});
