import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Component } from "../components/index.ts";
import { TUI, type KeyEventHandler, type KeyEventSource, type TuiRenderer } from "./index.ts";

class Source implements KeyEventSource {
  handler: KeyEventHandler | null = null;
  on(_event: "keypress", handler: KeyEventHandler): void { this.handler = handler; }
  off(_event: "keypress", handler: KeyEventHandler): void { if (this.handler === handler) this.handler = null; }
  emit(raw: string, sequence = "fallback"): void { this.handler?.({ raw, sequence, source: "raw" }); }
}
class Receiver extends Component {
  readonly renderable = { requestRender() {} } as unknown as Renderable;
  received: string[] = [];
  wantsKeyRelease?: boolean;
  handleInput(data: string): void { this.received.push(data); }
}
const renderer = () => ({
  root: { add() {} },
  requestRender() {},
  destroy() {},
  width: 80,
  height: 24,
  keyInput: { on() {}, off() {} },
  resize() {},
  on() {},
  off() {},
}) as unknown as TuiRenderer;

describe("TUI key routing", () => {
  it("forwards raw key data to the focused component", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    source.emit("\x03");
    assert.deepEqual(receiver.received, ["\x03"]);
  });

  it("short-circuits when an input listener consumes", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    tui.addInputListener(() => ({ consume: true }));
    source.emit("x");
    assert.deepEqual(receiver.received, []);
  });

  it("chains listener transforms before focus delivery", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    tui.addInputListener(() => ({ data: "a" }));
    tui.addInputListener((data) => ({ data: `${data}b` }));
    source.emit("x");
    assert.deepEqual(receiver.received, ["ab"]);
  });

  it("filters release events unless the receiver opts in", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    source.emit("\x1b[99;5:3u");
    receiver.wantsKeyRelease = true;
    source.emit("\x1b[99;5:3u");
    assert.deepEqual(receiver.received, ["\x1b[99;5:3u"]);
  });
});
