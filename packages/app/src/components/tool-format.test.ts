import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { describeToolRun, formatToolRun, previewOutput, treePrefix } from "./tool-format.ts";

const run = (overrides: Partial<Parameters<typeof formatToolRun>[0]> = {}) => ({
  id: "tool-1",
  name: "read",
  args: { path: "README.md" },
  status: "succeeded" as const,
  output: "one\ntwo\nthree",
  ...overrides,
});

describe("tool gutter formatting", () => {
  it("formats a glyph header and connector tree", () => {
    assert.equal(formatToolRun(run()), "⚙ read {\"path\":\"README.md\"} ✓\n  ⎿ one\n  │ two\n  ⎿ three");
  });

  it("surfaces hidden line count and expand hint", () => {
    const output = Array.from({ length: 8 }, (_, index) => `line ${index + 1}`).join("\n");
    assert.match(previewOutput(output, false), /^… 2 more lines · enter to expand/);
  });

  it("counts edit additions and removals", () => {
    const display = describeToolRun(run({ name: "edit", output: "-old\n+new\n context" }));
    assert.equal(display.added, 1);
    assert.equal(display.removed, 1);
    assert.match(formatToolRun(run({ name: "edit", output: "-old\n+new" })), /\+1 -1/);
  });

  it("uses end connectors at both ends", () => {
    assert.deepEqual([treePrefix(0, 3), treePrefix(1, 3), treePrefix(2, 3)], ["⎿", "│", "⎿"]);
  });
});
