import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TextAttributes } from "@opentui/core";
import { buildEditorContent } from "./content.ts";

const view = { lines: ["hello"], cursorRow: 0, cursorCol: 2, offset: 0 };

describe("buildEditorContent", () => {
  it("renders the cursor as a reverse-attribute chunk, never raw ANSI", () => {
    const styled = buildEditorContent(view, { width: 5, paddingX: 0, focused: true });
    for (const chunk of styled.chunks) assert.equal(chunk.text.includes("\x1b"), false);
    const cursor = styled.chunks.find((chunk) => ((chunk.attributes ?? 0) & TextAttributes.INVERSE) !== 0);
    assert.equal(cursor?.text, "l");
  });

  it("omits the cursor chunk when unfocused", () => {
    const styled = buildEditorContent(view, { width: 5, paddingX: 0, focused: false });
    assert.equal(styled.chunks.some((chunk) => ((chunk.attributes ?? 0) & TextAttributes.INVERSE) !== 0), false);
    assert.equal(styled.chunks.map((chunk) => chunk.text).join(""), "─────\nhello\n─────");
  });

  it("colors border bars when a border color is set", () => {
    const styled = buildEditorContent(view, { width: 5, paddingX: 1, focused: false, borderColor: "#585858", extraLines: ["  hint"] });
    const bars = styled.chunks.filter((chunk) => chunk.text.includes("─"));
    assert.equal(bars.length, 2);
    for (const barChunk of bars) assert.notEqual(barChunk.fg, undefined);
    assert.equal(styled.chunks.at(-1)?.text, "\n  hint");
  });
});
