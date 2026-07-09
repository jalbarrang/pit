import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Component } from "../components/index.ts";
import { TUI, type TuiRenderer } from "./index.ts";

class FakeRenderable { visible = true; height = 3; width: number | string = 0; left = 0; top = 0; zIndex = 0; position = "relative"; requestRender() {} }
class FocusComponent extends Component { readonly renderable = new FakeRenderable() as unknown as Renderable; focused = false; }
const renderer = () => ({
  width: 80, height: 24,
  root: { add() {}, remove() {} }, requestRender() {}, destroy() {}, keyInput: { on() {}, off() {} }, on() {}, off() {},
}) as unknown as TuiRenderer;

describe("stacked overlay focus restore", () => {
  it("returns from selector B to selector A, then to editor", async () => {
    const tui = await TUI.create({ renderer: renderer() });
    const editor = new FocusComponent(); const a = new FocusComponent(); const b = new FocusComponent();
    tui.setFocus(editor); const ah = tui.showOverlay(a); const bh = tui.showOverlay(b);
    bh.hide(); assert.equal(a.focused, true);
    ah.hide(); assert.equal(editor.focused, true);
  });

  it("keeps non-capturing overlays from stealing focus in a stack", async () => {
    const tui = await TUI.create({ renderer: renderer() });
    const editor = new FocusComponent(); const toast = new FocusComponent(); const a = new FocusComponent(); const b = new FocusComponent();
    tui.setFocus(editor); tui.showOverlay(toast, { nonCapturing: true }); const ah = tui.showOverlay(a); const bh = tui.showOverlay(b);
    bh.hide(); assert.equal(a.focused, true); assert.equal(toast.focused, false);
    ah.hide(); assert.equal(editor.focused, true); assert.equal(toast.focused, false);
  });

  it("does not restore focus to a hidden parent overlay", async () => {
    const tui = await TUI.create({ renderer: renderer() });
    const editor = new FocusComponent(); const a = new FocusComponent(); const b = new FocusComponent();
    tui.setFocus(editor); const ah = tui.showOverlay(a); const bh = tui.showOverlay(b);
    ah.setHidden(true); bh.hide();
    assert.equal(a.focused, false);
    assert.equal(tui.focusedComponent, editor);
  });
});
