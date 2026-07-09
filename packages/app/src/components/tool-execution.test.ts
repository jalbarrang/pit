import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Text } from "@pit/tui";
import { createTheme } from "../domain/theming/index.ts";
import { formatToolRun } from "./tool-format.ts";
import { ToolExecutionComponent } from "./tool-execution.ts";

class FakeBox { children: Renderable[] = []; options = {}; onMouseDown?: () => void; add(c: Renderable) { this.children.push(c); return 0; } remove(c: Renderable) { this.children = this.children.filter((x) => x !== c); } requestRender() {} }
class FakeText { content = ""; options: Record<string, unknown> = {}; requestRender() {} }
const fakeBox = () => new FakeBox() as unknown as Renderable & { add(child: Renderable): number; options: Record<string, unknown> };
const fakeText = () => new FakeText() as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("ToolExecutionComponent", () => {
  it("renders collapsed and expanded tool output", () => {
    const output = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`).join("\n");
    const run = { id: "1", name: "read", args: { path: "package.json" }, status: "running" as const, output };
    assert.match(formatToolRun(run), /… 2 more lines/);
    const component = new ToolExecutionComponent({} as never, run, createTheme("dark"), fakeBox(), fakeText());
    component.setExpanded(true);
    assert.match(String(component.getText()), /line 1/);
  });

  it("renders image placeholders after text output", () => {
    const shellBox = new FakeBox();
    const run = { id: "img", name: "read", args: {}, status: "succeeded" as const, output: "Read image", images: [{ data: "bad", mimeType: "image/png", filename: "cat.png" }] };
    new ToolExecutionComponent({} as never, run, createTheme("dark"), shellBox as never, fakeText(), { imageText: fakeText });
    assert.equal(shellBox.children.length, 2);
  });

  it("toggles expanded output on mouse down", () => {
    const shellBox = new FakeBox();
    const output = Array.from({ length: 8 }, (_, i) => `line ${i + 1}`).join("\n");
    const component = new ToolExecutionComponent({} as never, { id: "m", name: "read", args: {}, status: "succeeded", output }, createTheme("dark"), shellBox as never, fakeText());
    shellBox.onMouseDown?.();
    assert.match(String(component.getText()), /line 1/);
  });

  it("routes edit diffs to a structured diff view", () => {
    const shellBox = new FakeBox();
    const diffBox = new FakeBox();
    const line = (_ctx: never, text: string, fg: string) => new Text({} as never, text, 0, 0, { fg }, new FakeText() as never);
    const run = { id: "2", name: "edit", args: {}, status: "succeeded" as const, output: "-1 old\n+1 new" };
    const component = new ToolExecutionComponent({} as never, run, createTheme("dark"), shellBox as never, fakeText(), { box: diffBox as never, line: line as never });
    assert.equal(shellBox.children.length, 2);
    assert.equal(diffBox.children.length, 2);
    assert.doesNotMatch(String(component.getText()), /old/);
  });
});
