import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { SelectList, type SelectItem } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const fake = () => new FakeRenderable() as unknown as Renderable & { content: string };
const items: SelectItem[] = [
  { value: "alpha", label: "Alpha", description: "First" },
  { value: "beta", label: "Beta", description: "Second" },
  { value: "gamma", label: "Gamma", description: "Third" },
];

describe("SelectList", () => {
  it("moves selection with arrows and wraps", () => {
    const list = new SelectList({} as never, items, 3, {}, {}, fake() as never);
    list.handleInput("\x1b[B");
    assert.equal(list.getSelectedItem()?.value, "beta");
    list.handleInput("\x1b[A");
    list.handleInput("\x1b[A");
    assert.equal(list.getSelectedItem()?.value, "gamma");
  });

  it("filters items and resets selection", () => {
    const list = new SelectList({} as never, items, 3, {}, {}, fake() as never);
    list.handleInput("\x1b[B");
    list.setFilter("ga");
    assert.equal(list.getSelectedItem()?.value, "gamma");
    assert.equal(list.render(80)[0]?.includes("Gamma"), true);
  });

  it("fires enter and escape callbacks", () => {
    const list = new SelectList({} as never, items, 3, {}, {}, fake() as never);
    let selected = "";
    let cancelled = false;
    list.onSelect = (item) => { selected = item.value; };
    list.onCancel = () => { cancelled = true; };
    list.handleInput("\r");
    list.handleInput("\x1b");
    assert.equal(selected, "alpha");
    assert.equal(cancelled, true);
  });
});
