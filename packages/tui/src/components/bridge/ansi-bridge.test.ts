import assert from "node:assert/strict";
import { describe, it } from "node:test";
import chalk from "chalk";
import type { Renderable, StyledText } from "@opentui/core";
import { ATTR } from "../../domain/styling/ansi/index.ts";
import { AnsiBridge } from "./ansi-bridge.ts";
import type { LegacyComponent } from "./legacy.ts";
import { Text } from "../text.ts";

chalk.level = 3;

class FakeRenderable {
  children: Renderable[] = [];
  content: string | StyledText = "";
  options: Record<string, unknown> = {};
  renderRequests = 0;
  add(child: Renderable): number { this.children.push(child); return this.children.length - 1; }
  remove(child: Renderable): void { this.children = this.children.filter((c) => c !== child); }
  getChildrenCount(): number { return this.children.length; }
  requestRender(): void { this.renderRequests++; }
}

const fake = () => new FakeRenderable() as unknown as Renderable;

describe("AnsiBridge", () => {
  it("parses chalk-styled legacy lines into styled chunks", () => {
    const legacy: LegacyComponent = { render: () => [chalk.bold.red("hi")] };
    const box = fake() as never;
    const bridge = new AnsiBridge({} as never, legacy, box, (_ctx, content) => new Text({} as never, content, 0, 0, undefined, fake() as never));
    const content = bridge.lineContent(0) as StyledText;
    assert.equal(content.chunks[0]!.text, "hi");
    assert.equal((content.chunks[0]!.attributes ?? 0) & ATTR.BOLD, ATTR.BOLD);
  });

  it("reuses unchanged lines and replaces changed ones", () => {
    let lines = ["a", "b"];
    const legacy: LegacyComponent = { render: () => lines };
    const bridge = new AnsiBridge({} as never, legacy, fake() as never, (_ctx, content) => new Text({} as never, content, 0, 0, undefined, fake() as never));
    const first = bridge.lineContent(0);
    lines = ["a", "B"];
    bridge.refresh();
    assert.equal(bridge.lineContent(0), first);
    assert.notEqual(bridge.lineContent(1), first);
    assert.equal((bridge.lineContent(1) as StyledText).chunks[0]!.text, "B");
  });

  it("forwards handleInput, focused, and invalidate", () => {
    const calls: string[] = [];
    const legacy: LegacyComponent = {
      render: () => ["x"],
      handleInput: (d) => calls.push(`in:${d}`),
      invalidate: () => calls.push("inv"),
      focused: false,
    };
    const bridge = new AnsiBridge({} as never, legacy, fake() as never, (_ctx, content) => new Text({} as never, content, 0, 0, undefined, fake() as never));
    bridge.handleInput("z");
    bridge.focused = true;
    bridge.invalidate();
    assert.deepEqual(calls, ["in:z", "inv"]);
    assert.equal(legacy.focused, true);
  });

  it("passes measured width into legacy.render", () => {
    const widths: number[] = [];
    const legacy: LegacyComponent = { render: (w) => { widths.push(w); return [`w=${w}`]; } };
    const bridge = new AnsiBridge({} as never, legacy, fake() as never, (_ctx, content) => new Text({} as never, content, 0, 0, undefined, fake() as never));
    bridge.setWidth(40);
    assert.deepEqual(widths, [80, 40]);
  });
});
