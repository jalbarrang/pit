import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Component } from "../components/index.ts";
import { TUI, type TuiRenderer } from "./index.ts";

class FakeRenderable {
  requestRender(): void {}
}
class StubComponent extends Component {
  readonly renderable = new FakeRenderable() as unknown as Renderable;
  focused = false;
}
const fakeRenderer = () => {
  const added: Renderable[] = [];
  let renders = 0;
  let destroyed = false;
  const renderer = {
    root: { add: (renderable: Renderable) => added.push(renderable) },
    requestRender: () => { renders++; },
    destroy: () => { destroyed = true; },
    width: 80,
    height: 24,
    keyInput: { on() {}, off() {} },
    resize() {},
    on() {},
    off() {},
  } as unknown as TuiRenderer;
  return { renderer, added, get renders() { return renders; }, get destroyed() { return destroyed; } };
};

describe("TUI", () => {
  it("mounts children into renderer root", async () => {
    const fake = fakeRenderer();
    const tui = await TUI.create({ renderer: fake.renderer });
    const child = new StubComponent();
    tui.addChild(child);
    assert.deepEqual(fake.added, [child.renderable]);
  });

  it("uses focus policy to move focus flags", async () => {
    const tui = await TUI.create({ renderer: fakeRenderer().renderer });
    const first = new StubComponent();
    const second = new StubComponent();
    tui.setFocus(first);
    tui.setFocus(second);
    assert.equal(first.focused, false);
    assert.equal(second.focused, true);
  });

  it("requests renders and destroys renderer on stop", async () => {
    const fake = fakeRenderer();
    const tui = await TUI.create({ renderer: fake.renderer });
    tui.requestRender(true);
    tui.stop();
    assert.equal(fake.renders, 1);
    assert.equal(fake.destroyed, true);
  });
});
