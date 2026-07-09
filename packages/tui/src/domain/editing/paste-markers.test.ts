import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EditorModel } from "./index.ts";

describe("EditorModel large paste markers", () => {
  it("ports pi paste marker: collapses pastes over ten lines and expands them", () => {
    const model = new EditorModel();
    const paste = Array.from({ length: 11 }, (_, i) => `line${i}`).join("\n");
    model.insertPaste(paste);
    assert.equal(model.getText(), "[paste #1 +11 lines]");
    assert.equal(model.getExpandedText(), paste);
  });

  it("ports pi paste marker: collapses pastes over one thousand chars", () => {
    const model = new EditorModel();
    const paste = "x".repeat(1001);
    model.insertPaste(paste);
    assert.equal(model.getText(), "[paste #1 1001 chars]");
    assert.equal(model.getExpandedText(), paste);
  });

  it("undoes a marker paste as one unit and keeps multiple marker ids", () => {
    const model = new EditorModel();
    const a = Array.from({ length: 11 }, (_, i) => `a${i}`).join("\n");
    const b = "b".repeat(1001);
    model.insertPaste(a);
    model.insert(" ", true);
    model.insertPaste(b);
    assert.equal(model.getText(), "[paste #1 +11 lines] [paste #2 1001 chars]");
    assert.equal(model.getExpandedText(), `${a} ${b}`);
    model.undo();
    assert.equal(model.getText(), "[paste #1 +11 lines] ");
  });

  it("expands a marker before an edit touches it", () => {
    const model = new EditorModel();
    const paste = "x".repeat(1001);
    model.insert("A", true);
    model.insertPaste(paste);
    model.backspace();
    assert.equal(model.getText(), `A${"x".repeat(1000)}`);
    assert.equal(model.getExpandedText(), model.getText());
  });
});
