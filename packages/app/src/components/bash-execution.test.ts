import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { createTheme } from "../domain/theming/index.ts";
import { BashExecutionComponent } from "./bash-execution.ts";

class FakeBox {
  children: Renderable[] = [];
  options = {};
  onMouseDown?: () => void;
  add(c: Renderable) {
    this.children.push(c);
    return 0;
  }
  remove(c: Renderable) {
    this.children = this.children.filter((x) => x !== c);
  }
  requestRender() {}
}
class FakeText {
  content = "";
  options: Record<string, unknown> = {};
  requestRender() {}
}
const fakeBox = () =>
  new FakeBox() as unknown as Renderable & { add(child: Renderable): number; options: Record<string, unknown> };
const fakeText = () =>
  new FakeText() as unknown as Renderable & { content: string; options: Record<string, unknown> };

describe("BashExecutionComponent", () => {
  it("renders header with and without excluded marker", () => {
    const plain = new BashExecutionComponent({} as never, "ls", false, createTheme("dark"), fakeBox(), fakeText());
    assert.match(String(plain.getText()), /^\$ ls/);
    assert.doesNotMatch(String(plain.getText()), /excluded/);

    const excluded = new BashExecutionComponent({} as never, "rm -rf /", true, createTheme("dark"), fakeBox(), fakeText());
    assert.match(String(excluded.getText()), /\$ rm -rf \/  \(excluded\)/);
  });

  it("accumulates output and shows collapsed tail-20 with more-lines marker", () => {
    const component = new BashExecutionComponent({} as never, "seq 25", false, createTheme("dark"), fakeBox(), fakeText());
    for (let i = 1; i <= 25; i++) component.appendOutput(i === 1 ? `line ${i}` : `\nline ${i}`);
    const text = String(component.getText());
    assert.match(text, /… 5 more lines/);
    assert.match(text, /line 25/);
    assert.doesNotMatch(text, /line 5\n/);
  });

  it("shows full output when expanded", () => {
    const component = new BashExecutionComponent({} as never, "seq 25", false, createTheme("dark"), fakeBox(), fakeText());
    component.appendOutput(Array.from({ length: 25 }, (_, i) => `line ${i + 1}`).join("\n"));
    component.setExpanded(true);
    assert.match(String(component.getText()), /line 1/);
    assert.doesNotMatch(String(component.getText()), /more lines/);
  });

  it("renders exit status, omits clean exit, and shows cancelled", () => {
    const failed = new BashExecutionComponent({} as never, "false", false, createTheme("dark"), fakeBox(), fakeText());
    failed.setComplete(1, false);
    assert.match(String(failed.getText()), /exit 1/);

    const ok = new BashExecutionComponent({} as never, "true", false, createTheme("dark"), fakeBox(), fakeText());
    ok.setComplete(0, false);
    assert.doesNotMatch(String(ok.getText()), /exit /);
    assert.doesNotMatch(String(ok.getText()), /cancelled/);

    const cancelled = new BashExecutionComponent({} as never, "sleep 10", false, createTheme("dark"), fakeBox(), fakeText());
    cancelled.setComplete(undefined, true);
    assert.match(String(cancelled.getText()), /cancelled/);
  });
});
