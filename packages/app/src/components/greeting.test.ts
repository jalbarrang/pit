import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import type { TextContent } from "@pit/tui";
import { createTheme } from "../domain/theming/index.ts";
import { GreetingComponent } from "./greeting.ts";

class FakeText { content: TextContent = ""; options: Record<string, unknown> = {}; requestRender() {} }

describe("GreetingComponent", () => {
  it("renders branded pit identity and command hint", () => {
    const renderable = new FakeText() as unknown as Renderable & { content: TextContent; options: Record<string, unknown> };
    new GreetingComponent({} as never, createTheme("dark"), renderable);
    const chunks = (renderable.content as { chunks: Array<{ text: string; fg?: unknown }> }).chunks;
    assert.equal(chunks.map((chunk) => chunk.text).join(""), "pit v0.0.0-dev · pi agent · /help for commands");
    assert.notEqual(chunks[0]?.fg, undefined);
  });
});
