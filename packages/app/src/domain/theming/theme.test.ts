import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTheme, getDefaultTextStyle, getEditorTheme, getMarkdownTheme, loadThemeJson } from "./index.ts";

describe("pit theme tokens", () => {
  it("resolves the dark glamour palette", () => {
    const theme = createTheme("dark");
    assert.equal(theme.color("brand"), "#ff5f87");
    assert.equal(theme.color("interactive"), "#a78bfa");
    assert.equal(theme.color("userMessageBg"), "#251d36");
    assert.deepEqual(theme.bg("toolSuccessBg"), { bg: "#171d1a" });
    assert.deepEqual(theme.fg("mdHeading"), { fg: "#e8bc70" });
  });

  it("maps hybrid tokens into markdown and editor themes", () => {
    const theme = createTheme("dark");
    assert.equal(getMarkdownTheme(theme).link.fg, "#a78bfa");
    assert.equal(getDefaultTextStyle(theme).fg, "#d8d4e0");
    assert.equal(getEditorTheme(theme).textColor, "#d8d4e0");
    assert.equal(getEditorTheme(theme).borderColor, "#a78bfa");
  });

  it("keeps dark and light token keys in parity", () => {
    const dark = Object.keys(loadThemeJson("dark").colors).sort();
    const light = Object.keys(loadThemeJson("light").colors).sort();
    assert.deepEqual(light, dark);
  });
});
