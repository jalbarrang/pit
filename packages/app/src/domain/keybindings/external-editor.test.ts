import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveEditorCommand } from "./external-editor.ts";

describe("resolveEditorCommand", () => {
  it("prefers VISUAL over EDITOR", () => {
    assert.deepEqual(resolveEditorCommand({ VISUAL: "vim", EDITOR: "nano" }, "darwin"), ["vim"]);
  });

  it("splits editor command on spaces", () => {
    assert.deepEqual(resolveEditorCommand({ VISUAL: "code -w" }, "darwin"), ["code", "-w"]);
  });

  it("falls back to nano when unset on non-Windows", () => {
    assert.deepEqual(resolveEditorCommand({}, "darwin"), ["nano"]);
  });

  it("falls back to notepad on win32", () => {
    assert.deepEqual(resolveEditorCommand({}, "win32"), ["notepad"]);
  });
});
