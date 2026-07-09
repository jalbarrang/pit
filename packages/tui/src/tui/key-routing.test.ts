import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { Component } from "../components/index.ts";
import { TUI, type KeyEventHandler, type KeyEventSource, type PasteEventHandler, type PasteEventLike, type TuiRenderer } from "./index.ts";

class Source implements KeyEventSource {
  handler: KeyEventHandler | null = null;
  pasteHandler: PasteEventHandler | null = null;
  on(event: "keypress" | "paste", handler: KeyEventHandler | PasteEventHandler): void {
    if (event === "paste") this.pasteHandler = handler as PasteEventHandler;
    else this.handler = handler as KeyEventHandler;
  }
  off(event: "keypress" | "paste", handler: KeyEventHandler | PasteEventHandler): void {
    if (event === "paste" && this.pasteHandler === handler) this.pasteHandler = null;
    if (event === "keypress" && this.handler === handler) this.handler = null;
  }
  emit(raw: string, sequence = "fallback"): void { this.handler?.({ raw, sequence, source: "raw" }); }
  emitPaste(event: PasteEventLike): void { this.pasteHandler?.(event); }
}
class Receiver extends Component {
  readonly renderable = { requestRender() {} } as unknown as Renderable;
  received: string[] = [];
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

  it("re-wraps paste events as bracketed paste input", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    source.emitPaste({ bytes: new TextEncoder().encode("hello\nworld") });
    assert.deepEqual(receiver.received, ["\x1b[200~hello\nworld\x1b[201~"]);
  });

  it("prefers paste event text and ignores empty pastes", async () => {
    const source = new Source();
    const tui = await TUI.create({ renderer: renderer(), keySource: source });
    const receiver = new Receiver();
    tui.setFocus(receiver);
    source.emitPaste({ text: "plain" });
    source.emitPaste({});
    assert.deepEqual(receiver.received, ["\x1b[200~plain\x1b[201~"]);
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
