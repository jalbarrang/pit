import assert from "node:assert/strict";
import { describe, it } from "node:test";
import chalk from "chalk";
import { ATTR, ansi16Bg, ansi16Fg, parseAnsiLine } from "./index.ts";

chalk.level = 3;
const has = (attrs: number | undefined, bit: number) => ((attrs ?? 0) & bit) === bit;

describe("parseAnsiLine composition", () => {
  it("round-trips chalk.bold.red + chalk.bgBlue", () => {
    const chunks = parseAnsiLine(chalk.bold.red("x") + chalk.bgBlue(" y "));
    assert.equal(chunks.length, 2);
    assert.equal(chunks[0]!.text, "x");
    assert.ok(has(chunks[0]!.attributes, ATTR.BOLD));
    assert.deepEqual(chunks[0]!.fg, ansi16Fg(31));
    assert.equal(chunks[1]!.text, " y ");
    assert.deepEqual(chunks[1]!.bg, ansi16Bg(44));
    assert.equal(chunks[1]!.attributes ?? 0, ATTR.NONE);
    assert.equal(chunks[1]!.fg, undefined);
  });

  it("keeps nested bold+underline mid-line", () => {
    const chunks = parseAnsiLine("\x1b[1mb\x1b[4mu\x1b[24mn");
    assert.ok(has(chunks[0]!.attributes, ATTR.BOLD));
    assert.ok(has(chunks[1]!.attributes, ATTR.BOLD | ATTR.UNDERLINE));
    assert.ok(has(chunks[2]!.attributes, ATTR.BOLD));
    assert.ok(!has(chunks[2]!.attributes, ATTR.UNDERLINE));
  });

  it("attaches OSC8 hyperlink metadata", () => {
    const open = parseAnsiLine("\x1b]8;;https://x.test\x07hi\x1b]8;;\x07bye");
    assert.equal(open[0]!.text, "hi");
    assert.equal(open[0]!.link?.url, "https://x.test");
    assert.equal(open[1]!.text, "bye");
    assert.equal(open[1]!.link, undefined);
  });

  it("skips CURSOR_MARKER APC and other non-SGR CSI", () => {
    const chunks = parseAnsiLine("a\x1b_pi:c\x07b\x1b[2Kc");
    assert.equal(chunks.map((c) => c.text).join(""), "abc");
  });

  it("leaves wide chars untouched", () => {
    const [c] = parseAnsiLine("漢😀");
    assert.equal(c!.text, "漢😀");
  });

  it("returns empty chunk for empty line", () => {
    const chunks = parseAnsiLine("");
    assert.equal(chunks.length, 1);
    assert.equal(chunks[0]!.text, "");
  });

  it("clears inverse/strike with 27/29", () => {
    const chunks = parseAnsiLine("\x1b[7;9mx\x1b[27;29my");
    assert.ok(has(chunks[0]!.attributes, ATTR.INVERSE | ATTR.STRIKETHROUGH));
    assert.equal(chunks[1]!.attributes ?? 0, ATTR.NONE);
  });
});
