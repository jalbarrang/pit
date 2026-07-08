import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Editor, type EditorComponent } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}

describe("EditorComponent compliance", () => {
  it("satisfies the pi-compatible editor interface", () => {
    const editor: EditorComponent = new Editor({} as never, {}, {}, new FakeRenderable() as never);
    editor.setPaddingX?.(2);
    editor.setAutocompleteMaxVisible?.(7);
    editor.insertTextAtCursor?.("hello");
    assert.equal(editor.getExpandedText?.(), "hello");
  });
});
