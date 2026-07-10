import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveDefinitions, resolveMigrate } from "./upstream-defs.ts";

describe("resolveDefinitions", () => {
  it("includes tui.editor.cursorUp default up and app.interrupt default escape", () => {
    const defs = resolveDefinitions();
    const cursorUp = defs["tui.editor.cursorUp"]?.defaultKeys;
    const keys = Array.isArray(cursorUp) ? cursorUp : [cursorUp];
    assert.ok(keys.includes("up"), `expected up in ${JSON.stringify(cursorUp)}`);
    assert.equal(defs["app.interrupt"]?.defaultKeys, "escape");
  });
});

describe("resolveMigrate", () => {
  it("migrates expandTools to app.tools.expand", () => {
    const migrate = resolveMigrate();
    const { config } = migrate({ expandTools: "ctrl+o" });
    assert.equal(config["app.tools.expand"], "ctrl+o");
    assert.equal(config.expandTools, undefined);
  });
});
