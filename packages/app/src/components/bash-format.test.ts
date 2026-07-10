import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatBashHeader, formatBashOutput, formatBashStatus } from "./bash-format.ts";

describe("formatBashHeader", () => {
  it("prefixes the command with $", () => {
    assert.equal(formatBashHeader("ls -la", false), "$ ls -la");
  });

  it("appends excluded marker when excluded", () => {
    assert.equal(formatBashHeader("rm -rf /", true), "$ rm -rf /  (excluded)");
  });
});

describe("formatBashOutput", () => {
  it("returns full output when expanded", () => {
    const output = Array.from({ length: 25 }, (_, i) => `line ${i + 1}`).join("\n");
    assert.equal(formatBashOutput(output, true), output);
  });

  it("returns short output unchanged when collapsed", () => {
    assert.equal(formatBashOutput("a\nb\nc", false), "a\nb\nc");
  });

  it("shows last 20 lines with more-lines marker when collapsed and truncated", () => {
    const lines = Array.from({ length: 25 }, (_, i) => `line ${i + 1}`);
    const result = formatBashOutput(lines.join("\n"), false);
    assert.match(result, /^… 5 more lines \(ctrl\+o expands\)\n/);
    assert.match(result, /line 6\n/);
    assert.match(result, /line 25$/);
    assert.doesNotMatch(result, /line 5\n/);
  });
});

describe("formatBashStatus", () => {
  it("returns cancelled when cancelled", () => {
    assert.equal(formatBashStatus(0, true), "cancelled");
    assert.equal(formatBashStatus(1, true), "cancelled");
    assert.equal(formatBashStatus(undefined, true), "cancelled");
  });

  it("returns exit code when nonzero", () => {
    assert.equal(formatBashStatus(1, false), "exit 1");
    assert.equal(formatBashStatus(127, false), "exit 127");
  });

  it("returns empty for clean exit and running", () => {
    assert.equal(formatBashStatus(0, false), "");
    assert.equal(formatBashStatus(undefined, false), "");
    assert.equal(formatBashStatus(null, false), "");
  });
});
