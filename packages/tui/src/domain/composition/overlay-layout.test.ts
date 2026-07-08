import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSizeValue, resolveOverlayLayout } from "./index.ts";

describe("OverlayLayout", () => {
  it("parses percentage size values", () => {
    assert.equal(parseSizeValue("50%", 120), 60);
    assert.equal(parseSizeValue("12.5%", 80), 10);
    assert.equal(parseSizeValue("bad" as never, 80), undefined);
  });

  it("centers by default with a clamped width", () => {
    assert.deepEqual(resolveOverlayLayout(undefined, 4, 100, 30), { width: 80, row: 13, col: 10 });
  });

  it("resolves bottom-right anchors with margins and offsets", () => {
    assert.deepEqual(resolveOverlayLayout({ anchor: "bottom-right", width: 20, margin: 2, offsetX: -1, offsetY: -2 }, 5, 80, 24), {
      width: 20,
      row: 15,
      col: 57,
    });
  });

  it("maps row and column percentages within available space", () => {
    assert.deepEqual(resolveOverlayLayout({ width: "50%", row: "100%", col: "50%" }, 4, 100, 30), {
      width: 50,
      row: 26,
      col: 25,
    });
  });

  it("clamps width and max height to margins", () => {
    assert.deepEqual(resolveOverlayLayout({ width: 100, maxHeight: "90%", margin: { left: 5, right: 5, top: 2, bottom: 2 } }, 40, 80, 20), {
      width: 70,
      row: 2,
      col: 5,
      maxHeight: 16,
    });
  });
});
