import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shellClickAction } from "./mouse-routing.ts";

describe("shell mouse routing", () => {
  it("maps clickable regions to shell actions", () => {
    assert.equal(shellClickAction("editor"), "focus-editor");
    assert.equal(shellClickAction("tool"), "toggle-tool");
    assert.equal(shellClickAction("chat"), "none");
  });
});
