import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { visibleWidth } from "../styling/index.ts";
import { EditorModel, visualLines } from "./index.ts";

describe("editing visual line wrap", () => {
  it("ports regression-regional-indicator-width: wraps partial flag before overflow", () => {
    const state = { lines: ["      - 🇨"], cursor: { line: 0, col: 0 } };
    const wrapped = visualLines(state, 9).map((vl) => state.lines[0]!.slice(vl.start, vl.start + vl.length));
    assert.deepEqual(wrapped, ["      - ", "🇨"]);
    assert.deepEqual(wrapped.map(visibleWidth), [8, 2]);
  });

  it("ports regression-overlay-cjk-boundary: keeps a wide grapheme out of a full line", () => {
    const state = { lines: ["abcd让EFGH"], cursor: { line: 0, col: 0 } };
    const wrapped = visualLines(state, 5).map((vl) => state.lines[0]!.slice(vl.start, vl.start + vl.length));
    assert.deepEqual(wrapped, ["abcd", "让EFG", "H"]);
    assert.ok(wrapped.every((line) => visibleWidth(line) <= 5));
  });

  it("moves vertically across wrapped CJK by terminal cell column", () => {
    const model = new EditorModel();
    model.width = 5;
    model.setText("abcd让EFGH");
    model.start();
    for (let i = 0; i < 3; i++) model.right();
    model.down();
    assert.deepEqual(model.getCursor(), { line: 0, col: 6 });
  });
});
