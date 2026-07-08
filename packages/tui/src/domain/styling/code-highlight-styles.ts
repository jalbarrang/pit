import type { MarkdownStyle, MarkdownTheme, SyntaxStyleRecord } from "./markdown-theme-types.ts";

/** Derive tree-sitter highlight token colors from markdown code theme fields. */
export function codeHighlightStyles(theme: MarkdownTheme): SyntaxStyleRecord {
  const base: MarkdownStyle = { ...theme.codeBlock };
  const muted: MarkdownStyle = { ...theme.codeBlockBorder, italic: true };
  return {
    keyword: { ...base, bold: true },
    string: { ...theme.code },
    comment: muted,
    number: { ...base },
    function: { ...base, bold: true },
    type: { ...base },
    operator: { ...base },
    variable: { ...base },
    property: { ...base },
    "punctuation.bracket": { ...base },
    "punctuation.delimiter": { ...theme.codeBlockBorder },
    "diff.plus": { fg: "#A3BE8C" },
    "diff.minus": { fg: "#BF616A" },
  };
}
