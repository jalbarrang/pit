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
    const opts = box.children.map((child) => (child as Renderable & { options: Record<string, unknown> }).options);
    assert.equal(opts[0].fg, "#cc6666");
    assert.equal(opts[1].fg, "#b5bd68");
    assert.equal(opts[2].fg, "#808080");
  });
});
