import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifyDiffLines, isDiffText } from "./diff-lines.ts";

const fixture = [
  "@@ -1,3 +1,3 @@",
  " 1 unchanged",
  "-2 old value",
  "+2 new value",
  " 3 tail",
].join("\n");

describe("diff line classification", () => {
  it("classifies hunk headers, context, removals, and additions", () => {
    assert.deepEqual(classifyDiffLines(fixture), [
      { kind: "hunk", text: "@@ -1,3 +1,3 @@" },
      { kind: "context", text: " 1 unchanged" },
      { kind: "removed", text: "-2 old value" },
      { kind: "added", text: "+2 new value" },
      { kind: "context", text: " 3 tail" },
    ]);
  });

  it("detects numbered edit/write diffs", () => {
    assert.equal(isDiffText(fixture), true);
    assert.equal(isDiffText("Successfully wrote 10 bytes"), false);
  });

  it("normalizes tabs before rendering", () => {
    assert.equal(classifyDiffLines("+1\tindented")[0].text, "+1   indented");
  });
});
