import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Editor } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const editor = () => new Editor({} as never, {}, {}, new FakeRenderable() as never);

describe("Editor kill ring and undo", () => {
  it("kills text, yanks it, and yank-pop cycles", () => {
    const e = editor();
    e.setText("one");
    e.handleInput("\x15");
    e.handleInput("x");
    e.handleInput("\x15");
    e.handleInput("\x19");
    assert.equal(e.getText(), "x");
    e.handleInput("\x1by");
    assert.equal(e.getText(), "one");
  });

  it("coalesces consecutive typing into one undo entry", () => {
    const e = editor();
    for (const ch of "hello") e.handleInput(ch);
    e.handleInput("\x1f");
    assert.equal(e.getText(), "");
  });

  it("undoes word deletion and redo restores it", () => {
    const e = editor();
    e.setText("hello world");
    e.handleInput("\x17");
    assert.equal(e.getText(), "hello ");
    e.handleInput("\x1f");
    assert.equal(e.getText(), "hello world");
    e.handleInput("\x1b[90;6u");
    assert.equal(e.getText(), "hello ");
  });
});
