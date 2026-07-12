import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../../domain/theming/index.ts";
import type { MarkdownPort } from "./markdown-port.ts";
import { UserMessageComponent } from "./user-message.ts";

const fakeBox = () => ({ add() { return 0; }, options: {} }) as unknown as Renderable & { add(child: Renderable): number; border?: Array<"top" | "right" | "bottom" | "left">; borderColor?: unknown; options?: Record<string, unknown> };
const fakeMarkdown = (): MarkdownPort => {
  let text = "";
  return { renderable: {} as Renderable, setText: (value) => { text = value; }, appendText: (delta) => { text += delta; }, setStreaming() {}, getText: () => text };
};

describe("UserMessageComponent", () => {
  it("binds user text into the violet-spined slab", () => {
    const box = fakeBox();
    const component = new UserMessageComponent({} as never, "hello", createTheme("dark"), box, fakeMarkdown());
    assert.equal(component.getText(), "hello");
    assert.deepEqual(box.border, ["left"]);
    assert.equal(box.borderColor, "#a78bfa");
    assert.deepEqual(box.options, {
      paddingX: 1,
      paddingY: 0,
      backgroundColor: "#1d1826",
      border: ["left"],
      borderColor: "#a78bfa",
    });
  });

  it("drops raw escapes before user markdown", () => {
    const component = new UserMessageComponent({} as never, "\x1b[32mok\x1b[0m \x1b_Gbad\x1b\\done", createTheme("dark"), fakeBox(), fakeMarkdown());
    assert.equal(component.getText(), "ok done");
  });
});
