import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveCodeFenceFiletype, isKnownCodeFenceLanguage } from "./code-fence-lang.ts";
import { codeHighlightStyles } from "./code-highlight-styles.ts";
import type { MarkdownTheme } from "./markdown-theme-types.ts";

const theme: MarkdownTheme = {
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
};

describe("resolveCodeFenceFiletype", () => {
  it("maps pi-common fence aliases to tree-sitter filetypes", () => {
    assert.equal(resolveCodeFenceFiletype("ts"), "typescript");
    assert.equal(resolveCodeFenceFiletype("js"), "javascript");
    assert.equal(resolveCodeFenceFiletype("py"), "python");
    assert.equal(resolveCodeFenceFiletype("go"), "go");
    assert.equal(resolveCodeFenceFiletype("rust"), "rust");
    assert.equal(resolveCodeFenceFiletype("bash"), "bash");
    assert.equal(resolveCodeFenceFiletype("json"), "json");
    assert.equal(resolveCodeFenceFiletype("diff"), "diff");
  });

  it("returns undefined for unknown languages so callers can fall back plain", () => {
    assert.equal(resolveCodeFenceFiletype("unknownlang"), undefined);
    assert.equal(resolveCodeFenceFiletype(""), undefined);
    assert.equal(isKnownCodeFenceLanguage("unknownlang"), false);
    assert.equal(isKnownCodeFenceLanguage("ts"), true);
  });
});

describe("codeHighlightStyles", () => {
  it("builds keyword string and comment tokens from code theme colors", () => {
    const styles = codeHighlightStyles(theme);
    assert.deepEqual(styles.keyword, { fg: "#A3BE8C", bold: true });
    assert.deepEqual(styles.string, { fg: "#A3BE8C" });
    assert.deepEqual(styles.comment, { fg: "#4C566A", italic: true });
  });
});
