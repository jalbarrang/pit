import assert from "node:assert/strict";
import { before, test } from "node:test";
import { KeybindingsManager, setKeybindings } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";
import type { TreeNode } from "../../domain/tree/index.ts";
import { make, TREE_HINT } from "./tree-overlay.test.ts";

before(() => { setKeybindings(new KeybindingsManager(APP_KEYBINDINGS)); });

const chain = (n: number): TreeNode[] => {
  let leaf: TreeNode = { id: `n${n - 1}`, kind: "user", text: `row${n - 1}`, children: [] };
  for (let i = n - 2; i >= 0; i--) {
    leaf = { id: `n${i}`, kind: i % 2 === 0 ? "user" : "assistant", text: `row${i}`, children: [leaf] };
  }
  return [leaf];
};

test("windowing: slice + edge markers scroll with selection", () => {
  const { overlay, content } = make({ nodes: chain(30), leafId: "n0", maxVisible: 10 });
  assert.ok(content().includes("↓ 20 more"));
  assert.equal(content().split("\n").some((l) => /^↑ \d+ more$/.test(l)), false);
  const rowLines = () => content().split("\n").filter((l) => /^(→ |  )(➤ )?[·▾▸] /.test(l));
  assert.ok(rowLines()[0]!.includes("row0"));
  for (let i = 0; i < 10; i++) overlay.handleInput("\x1b[B");
  assert.ok(rowLines()[0]!.includes("row5"));
  for (let i = 0; i < 5; i++) overlay.handleInput("\x1b[B");
  const lines = content().split("\n");
  assert.ok(lines.some((l) => l.includes("↑ 10 more")));
  assert.ok(lines.some((l) => l.includes("↓ 10 more")));
  const slice = rowLines();
  assert.equal(slice.length, 10);
  assert.ok(slice[0]!.includes("row10") && slice[9]!.includes("row19"));
  assert.equal(lines.at(-1), TREE_HINT);
});
