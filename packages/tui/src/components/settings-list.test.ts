import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { SettingsList, type SettingItem } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const fake = () => new FakeRenderable() as unknown as Renderable & { content: string };
const items = (): SettingItem[] => [{ id: "theme", label: "Theme", currentValue: "dark", values: ["dark", "light"] }];

describe("SettingsList", () => {
  it("cycles values on enter and fires onChange", () => {
    const changes: string[] = [];
    const list = new SettingsList({} as never, items(), 5, {}, (id, value) => changes.push(`${id}:${value}`), () => {}, {}, fake() as never);
    list.handleInput("\r");
    assert.equal(list.getSelectedItem()?.currentValue, "light");
    assert.deepEqual(changes, ["theme:light"]);
  });

  it("cycles backward and forward with left/right", () => {
    const list = new SettingsList({} as never, items(), 5, {}, () => {}, () => {}, {}, fake() as never);
    list.handleInput("\x1b[D");
    assert.equal(list.getSelectedItem()?.currentValue, "light");
    list.handleInput("\x1b[C");
    assert.equal(list.getSelectedItem()?.currentValue, "dark");
  });

  it("fires cancel on escape", () => {
    let cancelled = false;
    const list = new SettingsList({} as never, items(), 5, {}, () => {}, () => { cancelled = true; }, {}, fake() as never);
    list.handleInput("\x1b");
    assert.equal(cancelled, true);
  });
});
