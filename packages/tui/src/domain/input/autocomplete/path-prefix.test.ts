import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractAtPrefix, extractPathPrefix } from "./path-prefix.ts";

describe("extractPathPrefix (auto-trigger)", () => {
  it("does not trigger on a trailing space after a word", () => {
    // Regression: typing "Hello " must not open cwd file autocomplete.
    assert.equal(extractPathPrefix("Hello "), null);
  });

  it("does not trigger on empty input", () => {
    assert.equal(extractPathPrefix(""), null);
  });

  it("does not trigger on a plain word", () => {
    assert.equal(extractPathPrefix("Hello"), null);
  });

  it("triggers on path-ish tokens", () => {
    assert.equal(extractPathPrefix("./pack"), "./pack");
    assert.equal(extractPathPrefix("src/comp"), "src/comp");
    assert.equal(extractPathPrefix("~/notes"), "~/notes");
    assert.equal(extractPathPrefix("edit ./a"), "./a");
  });

  it("does not trigger on a bare word after another word", () => {
    assert.equal(extractPathPrefix("open readme"), null);
  });

  it("does not trigger on a bare double quote", () => {
    assert.equal(extractPathPrefix('"'), null);
    assert.equal(extractPathPrefix('say "'), null);
  });
});

describe("extractPathPrefix (force)", () => {
  it("returns the empty trailing token when forced", () => {
    assert.equal(extractPathPrefix("Hello ", true), "");
    assert.equal(extractPathPrefix("open word", true), "word");
  });
});

describe("extractAtPrefix", () => {
  it("captures @ tokens at a boundary", () => {
    assert.equal(extractAtPrefix("see @src"), "@src");
    assert.equal(extractAtPrefix("@top"), "@top");
  });

  it("ignores @ mid-token", () => {
    assert.equal(extractAtPrefix("email a@b"), null);
  });
});
