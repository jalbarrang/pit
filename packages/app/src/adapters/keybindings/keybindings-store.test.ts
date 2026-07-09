import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KeybindingsStore } from "./keybindings-store.ts";

describe("KeybindingsStore", () => {
  it("migrates legacy ids and preserves tui defaults on install", () => {
    const store = new KeybindingsStore({
      readFile: () => JSON.stringify({ expandTools: "ctrl+o" }),
    });
    const mgr = store.install();
    assert.deepEqual(mgr.getKeys("app.tools.expand"), ["ctrl+o"]);
    assert.deepEqual(mgr.getKeys("tui.editor.cursorUp"), ["up"]);
  });

  it("load returns {} and install succeeds when file is missing", () => {
    const store = new KeybindingsStore({ readFile: () => undefined });
    assert.deepEqual(store.load(), {});
    const mgr = store.install();
    assert.deepEqual(mgr.getKeys("tui.editor.cursorUp"), ["up"]);
  });

  it("load returns {} for malformed JSON", () => {
    const store = new KeybindingsStore({ readFile: () => "not json{" });
    assert.deepEqual(store.load(), {});
  });
});
