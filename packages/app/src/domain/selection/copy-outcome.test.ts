import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { copyNotice, planCopy } from "./copy-outcome.ts";

describe("planCopy", () => {
  it("returns null for empty string", () => {
    assert.equal(planCopy(""), null);
  });

  it("returns null for whitespace-only text", () => {
    assert.equal(planCopy("   \n  "), null);
  });

  it("plans a single-line selection", () => {
    assert.deepEqual(planCopy("hello"), {
      text: "hello",
      charCount: 5,
      lineCount: 1,
    });
  });

  it("counts lines and chars for multiline text", () => {
    assert.deepEqual(planCopy("a\nb\nc"), {
      text: "a\nb\nc",
      charCount: 5,
      lineCount: 3,
    });
  });
});

describe("copyNotice", () => {
  it("reports char count for a single line", () => {
    assert.equal(
      copyNotice({ text: "x", charCount: 1, lineCount: 1 }, true),
      "Copied 1 chars",
    );
  });

  it("reports line count for multiple lines", () => {
    assert.equal(
      copyNotice({ text: "a\nb", charCount: 3, lineCount: 2 }, true),
      "Copied 2 lines",
    );
  });

  it("reports clipboard unavailable when copy failed", () => {
    assert.equal(
      copyNotice({ text: "x", charCount: 1, lineCount: 1 }, false),
      "Clipboard unavailable — terminal has no OSC52",
    );
  });
});
