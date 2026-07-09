import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldAttemptClipboardImage } from "./clipboard-support.ts";

describe("shouldAttemptClipboardImage", () => {
  it("returns true on darwin", () => {
    assert.equal(shouldAttemptClipboardImage("darwin"), true);
  });

  it("returns false on other platforms", () => {
    assert.equal(shouldAttemptClipboardImage("linux"), false);
    assert.equal(shouldAttemptClipboardImage("win32"), false);
    assert.equal(shouldAttemptClipboardImage(""), false);
  });
});
