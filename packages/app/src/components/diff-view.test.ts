import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Text } from "@pit/tui";
import { createTheme } from "../domain/theming/index.ts";
import { DiffViewComponent } from "./diff-view.ts";

class FakeText { content = ""; options: Record<string, unknown> = {}; requestRender() {} }
class FakeBox {
  children: Renderable[] = [];
  options: Record<string, unknown> = {};
  add(child: Renderable) { this.children.push(child); return this.children.length - 1; }
  remove(child: Renderable) { this.children = this.children.filter((c) => c !== child); }
  requestRender() {}
}

describe("DiffViewComponent", () => {
  it("renders classified diff lines with theme colors", () => {
    const box = new FakeBox();
    const line = (_ctx: never, text: string, fg: string) => new Text({} as never, text, 0, 0, { fg }, new FakeText() as never);
    new DiffViewComponent({} as never, "-1 old\n+1 new\n 2 ctx", createTheme("dark"), box as never, line as never);
    const rows = box.children as Array<Renderable & { content: string; options: Record<string, unknown> }>;
    assert.equal(rows[0].content, "  ⎿ -1 old");
    assert.equal(rows[1].content, "  │ +1 new");
    assert.equal(rows[2].content, "  ⎿  2 ctx");
    assert.equal(rows[0].options.fg, "#ff6b6b");
    assert.equal(rows[1].options.fg, "#7fd88f");
    assert.equal(rows[2].options.fg, "#6b6478");
  });
});
