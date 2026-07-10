import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EditorModel } from "./editor-model.ts";

describe("EditorModel prompt history", () => {
  it("recalls newest first and restores draft after browsing past end", () => {
    const model = new EditorModel();
    model.addToHistory("a");
    model.addToHistory("b");
    model.insert("draft");
    model.start();
    model.up();
    assert.equal(model.getText(), "b");
    model.up();
    assert.equal(model.getText(), "a");
    model.down();
    assert.equal(model.getText(), "b");
    model.down();
    assert.equal(model.getText(), "draft");
  });

  it("resets recall when the user edits after browsing", () => {
    const model = new EditorModel();
    model.addToHistory("a");
    model.addToHistory("b");
    model.up();
    assert.equal(model.getText(), "b");
    model.insert("x");
    model.start();
    model.up();
    assert.equal(model.getText(), "b");
  });
});
