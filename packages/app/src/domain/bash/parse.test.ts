import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseBashInput } from "./parse.ts";

describe("parseBashInput", () => {
  it("parses single-bang as included", () => {
    assert.deepEqual(parseBashInput("!ls -la"), { command: "ls -la", excluded: false });
  });

  it("parses double-bang as excluded", () => {
    assert.deepEqual(parseBashInput("!!rm x"), { command: "rm x", excluded: true });
  });

  it("returns null for empty command after bangs", () => {
    assert.equal(parseBashInput("!"), null);
    assert.equal(parseBashInput("!!"), null);
    assert.equal(parseBashInput("!!   "), null);
  });

  it("returns null for non-bang input", () => {
    assert.equal(parseBashInput("hello"), null);
  });

  it("trims leading spaces after bang", () => {
    assert.deepEqual(parseBashInput("! spaced"), { command: "spaced", excluded: false });
  });
});
