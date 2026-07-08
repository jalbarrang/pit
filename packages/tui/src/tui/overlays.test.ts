import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Component } from "../components/index.ts";
import { TUI, type TuiRenderer } from "./index.ts";

class FakeRenderable {
  visible = true;
  height = 3;
  width: number | string = 0;
  left = 0;
  top = 0;
  zIndex = 0;
  position = "relative";
  maxHeight?: number;
  requestRender(): void {}
}
class OverlayComponent extends Component {
  readonly renderable = new FakeRenderable() as unknown as Renderable;
  focused = false;
}
const fakeRenderer = (width = 80, height = 24) => {
  const mounted: Renderable[] = [];
  const renderer = {
    width,
    height,
    root: { add: (r: Renderable) => mounted.push(r), remove: (r: Renderable) => mounted.splice(mounted.indexOf(r), 1) },
    requestRender() {},
    destroy() {},
    keyInput: { on() {}, off() {} },
    resize(this: { width: number; height: number }, w: number, h: number) { this.width = w; this.height = h; },
    on() {},
    off() {},
  } as unknown as TuiRenderer;
  return { renderer, mounted };
};

describe("TUI overlays", () => {
  it("mounts and focuses visible capturing overlays", async () => {
    const fake = fakeRenderer();
    const tui = await TUI.create({ renderer: fake.renderer });
    const overlay = new OverlayComponent();
    const handle = tui.showOverlay(overlay, { width: "50%", anchor: "center" });
    const renderable = overlay.renderable as unknown as FakeRenderable;
    assert.equal(handle.isFocused(), true);
    assert.equal(renderable.width, 40);
    assert.equal(renderable.left, 20);
    assert.equal(renderable.top, 10);
    assert.deepEqual(fake.mounted, [overlay.renderable]);
  });

  it("keeps non-capturing overlays out of focus", async () => {
    const tui = await TUI.create({ renderer: fakeRenderer().renderer });
    const base = new OverlayComponent();
    const overlay = new OverlayComponent();
    tui.setFocus(base);
    tui.showOverlay(overlay, { nonCapturing: true });
    assert.equal(base.focused, true);
    assert.equal(overlay.focused, false);
  });

  it("hide restores focus to previous target", async () => {
    const tui = await TUI.create({ renderer: fakeRenderer().renderer });
    const base = new OverlayComponent();
    const overlay = new OverlayComponent();
    tui.setFocus(base);
    const handle = tui.showOverlay(overlay);
    handle.hide();
    assert.equal(base.focused, true);
    assert.equal(overlay.focused, false);
    assert.equal(tui.hasOverlay(), false);
  });

  it("setHidden restores focus and can refocus on show", async () => {
    const tui = await TUI.create({ renderer: fakeRenderer().renderer });
    const base = new OverlayComponent();
    const overlay = new OverlayComponent();
    tui.setFocus(base);
    const handle = tui.showOverlay(overlay);
    handle.setHidden(true);
    assert.equal(base.focused, true);
    handle.setHidden(false);
    assert.equal(overlay.focused, true);
  });
});
