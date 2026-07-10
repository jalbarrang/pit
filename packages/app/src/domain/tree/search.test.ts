import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TreeRow } from "./flatten.ts";
import { filterRows } from "./search.ts";

const row = (partial: Partial<TreeRow> & Pick<TreeRow, "id" | "text">): TreeRow => ({
  depth: 0,
  kind: "user",
  hasChildren: false,
  folded: false,
  ...partial,
});

describe("filterRows", () => {
  const rows = [
    row({ id: "1", text: "Hello World", label: "Bookmark" }),
    row({ id: "2", text: "other line" }),
    row({ id: "3", text: "zzz", label: "FINDME" }),
  ];

  it("empty query returns rows unchanged", () => {
    assert.equal(filterRows(rows, ""), rows);
  });

  it("matches text case-insensitively", () => {
    assert.deepEqual(
      filterRows(rows, "hello").map((r) => r.id),
      ["1"],
    );
  });

  it("matches label case-insensitively", () => {
    assert.deepEqual(
      filterRows(rows, "findme").map((r) => r.id),
      ["3"],
    );
    assert.deepEqual(
      filterRows(rows, "BOOK").map((r) => r.id),
      ["1"],
    );
  });
});
