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

  it("ports pi paste marker: collapses a 5000-line paste and expands it on demand", () => {
    const e = editor();
    const paste = Array.from({ length: 5000 }, (_, i) => `line${i}`).join("\n");
    e.handleInput(`\x1b[200~${paste}\x1b[201~`);
    assert.equal(e.getText(), "[paste #1 +5000 lines]");
    assert.equal(e.getExpandedText(), paste);
    e.handleInput("\x1f");
    assert.equal(e.getText(), "");
  });
});
