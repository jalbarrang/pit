import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CombinedAutocompleteProvider, Component, Container, Key, KeybindingsManager, TUI, TUI_KEYBINDINGS, fuzzyFilter, matchesKey, parseKey, resolveOverlayLayout } from "./index.ts";

describe("@pit/tui public barrel", () => {
  it("exports pi-tui-shaped core names", () => {
    assert.equal(typeof Component, "function");
    assert.equal(typeof Container, "function");
    assert.equal(typeof TUI.create, "function");
    assert.equal(typeof Key.ctrl("c"), "string");
    assert.equal(matchesKey("\x03", "ctrl+c"), true);
    assert.equal(parseKey("\x03"), "ctrl+c");
    assert.equal(new KeybindingsManager(TUI_KEYBINDINGS).getKeys("tui.input.submit")[0], "enter");
    assert.deepEqual(fuzzyFilter(["abc"], "ab", (item) => item), ["abc"]);
    assert.equal(new CombinedAutocompleteProvider([], "/tmp").shouldTriggerFileCompletion(["@"], 0, 1), true);
    assert.equal(resolveOverlayLayout({ width: "50%" }, 1, 80, 24).width, 40);
  });
});
