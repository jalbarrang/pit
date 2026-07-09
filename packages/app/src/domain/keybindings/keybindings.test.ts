import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { APP_KEYBINDINGS } from "./definitions.ts";
import { migrateKeybindingsConfig, toKeybindingsConfig } from "./migrations.ts";

describe("APP_KEYBINDINGS", () => {
  it("includes tui defaults and app defaults", () => {
    assert.equal(APP_KEYBINDINGS["tui.editor.cursorUp"].defaultKeys, "up");
    assert.equal(APP_KEYBINDINGS["app.interrupt"].defaultKeys, "escape");
    assert.equal(APP_KEYBINDINGS["app.tools.expand"].defaultKeys, "ctrl+o");
    assert.equal(APP_KEYBINDINGS["app.model.select"].defaultKeys, "ctrl+l");
  });
});

describe("migrateKeybindingsConfig", () => {
  it("renames legacy keys", () => {
    const { config, migrated } = migrateKeybindingsConfig({ expandTools: "ctrl+o" });
    assert.equal(migrated, true);
    assert.equal(config["app.tools.expand"], "ctrl+o");
  });

  it("leaves modern keys unchanged", () => {
    const { config, migrated } = migrateKeybindingsConfig({ "app.tools.expand": "ctrl+o" });
    assert.equal(migrated, false);
    assert.equal(config["app.tools.expand"], "ctrl+o");
  });
});

describe("toKeybindingsConfig", () => {
  it("filters non-string and non-string[] values", () => {
    const config = toKeybindingsConfig({
      "app.interrupt": "escape",
      "app.clear": ["ctrl+c"],
      badNumber: 1,
      badObject: { k: "v" },
      badMixed: ["ctrl+c", 2],
    });
    assert.deepEqual(config, {
      "app.interrupt": "escape",
      "app.clear": ["ctrl+c"],
    });
  });
});
