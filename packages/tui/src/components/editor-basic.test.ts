import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Editor } from "./index.ts";

class FakeRenderable {
  content = "";
  width?: number;
  height?: string | number;
  options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const fake = () => new FakeRenderable() as unknown as Renderable & { content: string; width?: number; height?: string | number; options: Record<string, unknown> };

describe("Editor basic editing", () => {
  it("edits multiline text with raw printable input and backspace", () => {
    const editor = new Editor({} as never, {}, {}, fake() as never);
    for (const ch of "abc") editor.handleInput(ch);
    editor.handleInput("\x7f");
    editor.handleInput("\x1b[13;2~");
    editor.handleInput("d");
    assert.equal(editor.getText(), "ab\nd");
    assert.deepEqual(editor.getCursor(), { line: 1, col: 1 });
  });

  it("moves cursor with arrows, home/end, and word movement", () => {
    const editor = new Editor({} as never, {}, {}, fake() as never);
    editor.setText("hello world");
    editor.handleInput("\x01");
    editor.handleInput("\x1b[C");
    editor.handleInput("Z");
    editor.handleInput("\x05");
    editor.handleInput("\x1bb");
    assert.equal(editor.getText(), "hZello world");
    assert.deepEqual(editor.getCursor(), { line: 0, col: 7 });
  });

  it("submits on enter and inserts newline on modified enter", () => {
    const editor = new Editor({} as never, {}, {}, fake() as never);
    let submitted = "";
    editor.onSubmit = (value) => { submitted = value; };
    editor.setText("hello");
    editor.handleInput("\x1b\r");
    for (const ch of "world") editor.handleInput(ch);
    editor.handleInput("\r");
    assert.equal(submitted, "hello\nworld");
    assert.equal(editor.getText(), "");
  });

  it("moves vertically through wrapped visual lines", () => {
    const editor = new Editor({} as never, {}, { width: 8 }, fake() as never);
    editor.setText("abcdef");
    editor.handleInput("\x01");
    editor.handleInput("\x1b[B");
    assert.deepEqual(editor.getCursor(), { line: 0, col: 4 });
  });

  it("recalls prompt history with up at the first line", () => {
    const editor = new Editor({} as never, {}, {}, fake() as never);
    editor.addToHistory("older");
    editor.addToHistory("newer");
    editor.handleInput("\x1b[A");
    assert.equal(editor.getText(), "newer");
    editor.handleInput("\x1b[A");
    assert.equal(editor.getText(), "older");
  });
});
