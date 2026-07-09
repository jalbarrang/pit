import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { visibleWidth } from "./index.ts";

describe("terminal visible width", () => {
  it("ports regression-regional-indicator-width: singleton flags stay wide", () => {
    assert.equal(visibleWidth("🇨"), 2);
    assert.equal(visibleWidth("      - 🇨"), 10);
  });

  it("ports regression-regional-indicator-width: full flags and emoji clusters stay width two", () => {
    for (const text of ["🇯🇵", "🇺🇸", "👍", "👍🏻", "⚡", "⚡️", "👨", "👨‍💻", "🏳️‍🌈"]) {
      assert.equal(visibleWidth(text), 2, text);
    }
  });
});
