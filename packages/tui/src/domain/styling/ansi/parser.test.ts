import assert from "node:assert/strict";
import { describe, it } from "node:test";
import chalk from "chalk";
import { ATTR, ansi16Bg, ansi16Fg, ansi256ToRgba, parseAnsiLine, rgbToRgba } from "./index.ts";

chalk.level = 3;

const has = (attrs: number | undefined, bit: number) => ((attrs ?? 0) & bit) === bit;

describe("parseAnsiLine attrs", () => {
  it("parses chalk.bold", () => {
    const [c] = parseAnsiLine(chalk.bold("a"));
    assert.equal(c!.text, "a");
    assert.ok(has(c!.attributes, ATTR.BOLD));
  });

  it("parses chalk.dim", () => {
    assert.ok(has(parseAnsiLine(chalk.dim("a"))[0]!.attributes, ATTR.DIM));
  });

  it("parses chalk.italic", () => {
    assert.ok(has(parseAnsiLine(chalk.italic("a"))[0]!.attributes, ATTR.ITALIC));
  });

  it("parses chalk.underline", () => {
    assert.ok(has(parseAnsiLine(chalk.underline("a"))[0]!.attributes, ATTR.UNDERLINE));
  });

  it("parses chalk.strikethrough", () => {
    assert.ok(has(parseAnsiLine(chalk.strikethrough("a"))[0]!.attributes, ATTR.STRIKETHROUGH));
  });

  it("parses chalk.inverse", () => {
    assert.ok(has(parseAnsiLine(chalk.inverse("a"))[0]!.attributes, ATTR.INVERSE));
  });

  it("clears bold+dim on SGR 22", () => {
    const chunks = parseAnsiLine("\x1b[1;2mx\x1b[22my");
    assert.ok(has(chunks[0]!.attributes, ATTR.BOLD));
    assert.equal(chunks[1]!.text, "y");
    assert.equal(chunks[1]!.attributes ?? 0, ATTR.NONE);
  });

  it("resets all attrs on SGR 0", () => {
    const chunks = parseAnsiLine("\x1b[1;3;4mx\x1b[0my");
    assert.equal(chunks[1]!.attributes ?? 0, ATTR.NONE);
    assert.equal(chunks[1]!.fg, undefined);
  });
});

describe("parseAnsiLine colors", () => {
  it("parses chalk.red fg", () => {
    const [c] = parseAnsiLine(chalk.red("a"));
    assert.deepEqual(c!.fg, ansi16Fg(31));
  });

  it("parses chalk.bgBlue", () => {
    const [c] = parseAnsiLine(chalk.bgBlue("a"));
    assert.deepEqual(c!.bg, ansi16Bg(44));
  });

  it("parses bright fg 90-97", () => {
    assert.deepEqual(parseAnsiLine("\x1b[91mx")[0]!.fg, ansi16Fg(91));
  });

  it("parses bright bg 100-107", () => {
    assert.deepEqual(parseAnsiLine("\x1b[104mx")[0]!.bg, ansi16Bg(104));
  });

  it("parses 256-color fg", () => {
    const [c] = parseAnsiLine(chalk.ansi256(196)("a"));
    assert.deepEqual(c!.fg, ansi256ToRgba(196));
  });

  it("parses 256-color bg", () => {
    const [c] = parseAnsiLine(chalk.bgAnsi256(21)("a"));
    assert.deepEqual(c!.bg, ansi256ToRgba(21));
  });

  it("parses truecolor fg/bg", () => {
    const fg = parseAnsiLine(chalk.rgb(10, 20, 30)("a"))[0]!;
    const bg = parseAnsiLine(chalk.bgRgb(1, 2, 3)("a"))[0]!;
    assert.deepEqual(fg.fg, rgbToRgba(10, 20, 30));
    assert.deepEqual(bg.bg, rgbToRgba(1, 2, 3));
  });
});
