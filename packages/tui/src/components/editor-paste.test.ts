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

describe("Editor bracketed paste", () => {
  it("inserts normalized bracketed paste as one undo entry", () => {
    const e = editor();
    for (const ch of "before ") e.handleInput(ch);
    e.handleInput("\x1b[200~a\r\nb\tc\x1b[201~");
    assert.equal(e.getText(), "before a\nb    c");
    e.handleInput("\x1f");
    assert.equal(e.getText(), "before ");
  });

  it("handles a 5000-line paste without per-character input", () => {
    const e = editor();
    const paste = Array.from({ length: 5000 }, (_, i) => `line${i}`).join("\n");
    e.handleInput(`\x1b[200~${paste}\x1b[201~`);
    assert.equal(e.getLines().length, 5000);
    assert.equal(e.getText().startsWith("line0\nline1"), true);
    e.handleInput("\x1f");
    assert.equal(e.getText(), "");
  });
});
