import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatCwd, formatFooter, formatTokens } from "./footer-format.ts";

describe("footer formatting", () => {
  it("compacts the home directory", () => {
    assert.equal(formatCwd("/Users/me/project", "/Users/me"), "~/project");
  });

  it("shows cwd, model, and token usage", () => {
    const text = formatFooter("/repo", "anthropic/model", { input: 1, output: 2, cacheRead: 3, cacheWrite: 4, total: 10 });
    assert.equal(text, "/repo  │  anthropic/model  │  10 tok");
    assert.equal(formatTokens({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }), "0 tok");
  });
});
