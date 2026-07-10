import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapTree } from "./tree-mapper.ts";

const entry = (partial: Record<string, unknown>) => ({
  type: "message",
  id: "e1",
  parentId: null,
  timestamp: "2024-01-01T00:00:00.000Z",
  ...partial,
});

const node = (entryFields: Record<string, unknown>, extras: Record<string, unknown> = {}) => ({
  entry: entry(entryFields),
  children: [],
  ...extras,
});

describe("mapTree", () => {
  it("maps user/assistant/tool/other kinds and nests children", () => {
    const sdk = [
      node(
        { id: "u1", message: { role: "user", content: "hello user" } },
        {
          label: "root",
          children: [
            node({
              id: "a1",
              parentId: "u1",
              message: { role: "assistant", content: [{ type: "text", text: "hi back" }] },
            }),
            node({
              id: "t1",
              parentId: "u1",
              message: {
                role: "toolResult",
                content: [{ type: "text", text: "tool out" }],
              },
            }),
            node({ id: "x1", parentId: "u1", type: "compaction", summary: "sum" }),
          ],
        },
      ),
    ];
    const [root] = mapTree(sdk);
    assert.equal(root.kind, "user");
    assert.equal(root.text, "hello user");
    assert.equal(root.label, "root");
    assert.equal(root.parentId, undefined);
    assert.equal(root.children[0].kind, "assistant");
    assert.equal(root.children[0].text, "hi back");
    assert.equal(root.children[0].parentId, "u1");
    assert.equal(root.children[1].kind, "tool");
    assert.equal(root.children[1].text, "tool out");
    assert.equal(root.children[2].kind, "other");
  });

  it("collapses whitespace and truncates text to 80 chars", () => {
    const long = `line1\n${"x".repeat(100)}`;
    const [root] = mapTree([node({ message: { role: "user", content: long } })]);
    assert.equal(root.text.includes("\n"), false);
    assert.equal(root.text.length, 80);
  });

  it("passes label and parses entry timestamp", () => {
    const [root] = mapTree([
      node(
        { message: { role: "user", content: "a" }, timestamp: "2024-06-15T12:00:00.000Z" },
        { label: "bookmark" },
      ),
    ]);
    assert.equal(root.label, "bookmark");
    assert.equal(root.timestamp, Date.parse("2024-06-15T12:00:00.000Z"));
  });
});
