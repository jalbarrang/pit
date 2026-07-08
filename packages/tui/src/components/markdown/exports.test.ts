import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  Markdown,
  type DefaultTextStyle,
  type MarkdownOptions,
  type MarkdownTheme,
} from "../../index.ts";

describe("@pit/tui markdown exports", () => {
  it("exports Markdown class and theme option type names for pi parity", () => {
    assert.equal(typeof Markdown, "function");
    const theme = {
      heading: { bold: true },
      link: {},
      linkUrl: {},
      code: {},
      codeBlock: {},
      codeBlockBorder: {},
      quote: {},
      quoteBorder: {},
      hr: {},
      listBullet: {},
      bold: { bold: true },
      italic: { italic: true },
      strikethrough: { strikethrough: true },
      underline: { underline: true },
    } satisfies MarkdownTheme;
    const options = { preserveOrderedListMarkers: true } satisfies MarkdownOptions;
    const defaults = { fg: "#fff" } satisfies DefaultTextStyle;
    assert.equal(theme.heading.bold, true);
    assert.equal(options.preserveOrderedListMarkers, true);
    assert.equal(defaults.fg, "#fff");
  });
});
