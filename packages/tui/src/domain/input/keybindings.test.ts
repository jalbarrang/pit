import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KeybindingsManager, TUI_KEYBINDINGS } from "./index.ts";

describe("KeybindingsManager", () => {
  it("binds Ctrl+J as a default newline alias", () => {
    const manager = new KeybindingsManager(TUI_KEYBINDINGS);
    assert.deepEqual(manager.getKeys("tui.input.newLine"), ["shift+enter", "ctrl+j"]);
    assert.equal(manager.matches("\n", "tui.input.newLine"), true);
    assert.equal(manager.matches("\x1b[106;5u", "tui.input.newLine"), true);
  });

  it("keeps defaults isolated from user rebinding", () => {
    const manager = new KeybindingsManager(TUI_KEYBINDINGS, { "tui.input.submit": ["enter", "ctrl+enter"] });
    assert.deepEqual(manager.getKeys("tui.input.submit"), ["enter", "ctrl+enter"]);
    assert.deepEqual(manager.getKeys("tui.select.confirm"), ["enter"]);
  });

  it("reports direct user conflicts without evicting defaults", () => {
    const manager = new KeybindingsManager(TUI_KEYBINDINGS, {
      "tui.input.submit": "ctrl+x",
      "tui.select.confirm": "ctrl+x",
    });
    assert.deepEqual(manager.getConflicts(), [{ key: "ctrl+x", keybindings: ["tui.input.submit", "tui.select.confirm"] }]);
    assert.deepEqual(manager.getKeys("tui.editor.cursorLeft"), ["left", "ctrl+b"]);
  });
});
