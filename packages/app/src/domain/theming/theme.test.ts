import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createTheme, getDefaultTextStyle, getEditorTheme, getMarkdownTheme } from "./index.ts";

describe("pit theme tokens", () => {
  it("resolves dark tokens to pi theme hex values", () => {
    const theme = createTheme("dark");
    assert.equal(theme.color("userMessageBg"), "#343541");
    assert.deepEqual(theme.bg("toolSuccessBg"), { bg: "#283228" });
    assert.deepEqual(theme.fg("mdHeading"), { fg: "#f0c674" });
  });

  it("maps pi tokens into markdown and editor themes", () => {
    const theme = createTheme("dark");
    assert.equal(getMarkdownTheme(theme).link.fg, "#81a2be");
    assert.equal(getDefaultTextStyle(theme).fg, "#d4d4d4");
    assert.equal(getEditorTheme(theme).textColor, "#d4d4d4");
  });
});
