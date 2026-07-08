import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { visibleWidth } from "../domain/styling/index.ts";
import { Input } from "./index.ts";

class FakeRenderable {
  content = "";
  options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const fake = () => new FakeRenderable() as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("Input", () => {
  it("edits text with printable input and backspace", () => {
    const input = new Input({} as never, fake() as never);
    for (const ch of "abc") input.handleInput(ch);
    input.handleInput("\x7f");
    assert.equal(input.getValue(), "ab");
    assert.equal(input.getCursor(), 2);
  });

  it("moves the cursor with arrows and ctrl+a/e", () => {
    const input = new Input({} as never, fake() as never);
    input.setValue("abcd");
    input.handleInput("\x01");
    input.handleInput("\x1b[C");
    input.handleInput("Z");
    input.handleInput("\x05");
    assert.equal(input.getValue(), "aZbcd");
    assert.equal(input.getCursor(), 5);
  });

  it("submits current value on enter", () => {
    const input = new Input({} as never, fake() as never);
    let submitted = "";
    input.onSubmit = (value) => { submitted = value; };
    input.setValue("hello\\");
    input.handleInput("\r");
    assert.equal(submitted, "hello\\");
  });

  it("keeps a cursor window inside the configured width", () => {
    const renderable = fake();
    const input = new Input({} as never, renderable as never);
    input.setWidth(8);
    input.setValue("abcdefghijklmnop");
    input.focused = true;
    assert.equal(visibleWidth(renderable.content.replace(/\x1b\[[0-9;]*m/g, "")) <= 8, true);
    assert.match(renderable.content, /\x1b\[7m/);
  });
});
