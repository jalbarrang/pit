import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { markdownThemeToSyntaxStyles } from "./markdown-theme.ts";
import type { MarkdownTheme } from "./markdown-theme-types.ts";

const theme = (partial: Partial<MarkdownTheme>): MarkdownTheme => ({
  heading: { fg: "#88C0D0", bold: true },
  link: { fg: "#81A1C1", underline: true },
  linkUrl: { fg: "#88C0D0", underline: true },
  code: { fg: "#A3BE8C" },
  codeBlock: { fg: "#A3BE8C" },
  codeBlockBorder: { fg: "#4C566A" },
  quote: { fg: "#D08770", italic: true },
  quoteBorder: { fg: "#4C566A" },
  hr: { fg: "#4C566A" },
  listBullet: { fg: "#B48EAD" },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
  ...partial,
});

describe("markdownThemeToSyntaxStyles", () => {
  it("maps heading style onto markup.heading and level variants", () => {
    const styles = markdownThemeToSyntaxStyles(theme({
      heading: { fg: "#88C0D0", bold: true },
    }));
    assert.deepEqual(styles["markup.heading"], { fg: "#88C0D0", bold: true });
    assert.deepEqual(styles["markup.heading.1"], { fg: "#88C0D0", bold: true, underline: true });
    assert.deepEqual(styles["markup.heading.2"], { fg: "#88C0D0", bold: true });
    assert.deepEqual(styles["markup.heading.3"], { fg: "#88C0D0", bold: true });
  });

  it("maps listBullet onto markup.list", () => {
    const styles = markdownThemeToSyntaxStyles(theme({
      listBullet: { fg: "#B48EAD" },
    }));
    assert.deepEqual(styles["markup.list"], { fg: "#B48EAD" });
  });

  it("maps inline, quote, link, and code styles onto markup groups", () => {
    const styles = markdownThemeToSyntaxStyles(theme({}), { fg: "#E6EDF3" });
    assert.deepEqual(styles.default, { fg: "#E6EDF3" });
    assert.deepEqual(styles["markup.strong"], { bold: true });
    assert.deepEqual(styles["markup.bold"], { bold: true });
    assert.deepEqual(styles["markup.italic"], { italic: true });
    assert.deepEqual(styles["markup.strikethrough"], { strikethrough: true });
    assert.deepEqual(styles["markup.raw"], { fg: "#A3BE8C" });
    assert.deepEqual(styles["markup.raw.inline"], { fg: "#A3BE8C" });
    assert.deepEqual(styles["markup.raw.block"], { fg: "#A3BE8C" });
    assert.deepEqual(styles["markup.quote"], { fg: "#D08770", italic: true });
    assert.deepEqual(styles["markup.link"], { fg: "#81A1C1", underline: true });
    assert.deepEqual(styles["markup.link.label"], { fg: "#81A1C1", underline: true });
    assert.deepEqual(styles["markup.link.url"], { fg: "#88C0D0", underline: true });
    assert.deepEqual(styles.conceal, { fg: "#4C566A" });
  });
});
