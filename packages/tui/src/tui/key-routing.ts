import { isKeyRelease, matchesKey } from "../domain/input/index.ts";
import type { Component } from "../components/index.ts";
import type { InputListener, KeyEventLike, KeyEventSource, PasteEventLike } from "./key-source.ts";

type RoutingHost = {
  focusedComponent: Component | null;
  onDebug?: () => void;
  requestRender: () => void;
};

export class KeyRouter {
  private listeners = new Set<InputListener>();
  private handler = (event: KeyEventLike) => this.handleKeyEvent(event);
  private pasteHandler = (event: PasteEventLike) => this.handlePasteEvent(event);
  private host: RoutingHost;
  constructor(host: RoutingHost) {
    this.host = host;
  }

  bind(source: KeyEventSource): void {
    source.on("keypress", this.handler);
    source.on("paste", this.pasteHandler);
  }

  unbind(source: KeyEventSource): void {
    source.off("keypress", this.handler);
    source.off("paste", this.pasteHandler);
  }

  addInputListener(listener: InputListener): () => void {
    this.listeners.add(listener);
    return () => this.removeInputListener(listener);
  }

  removeInputListener(listener: InputListener): void {
    this.listeners.delete(listener);
  }

  handleKeyEvent(event: KeyEventLike): void {
    const data = event.raw ?? event.sequence ?? "";
    this.handleInput(data);
  }

  handlePasteEvent(event: PasteEventLike): void {
    const text = event.text ?? (event.bytes ? new TextDecoder().decode(event.bytes) : "");
    if (text.length === 0) return;
    this.handleInput(`\x1b[200~${text}\x1b[201~`);
  }

  handleInput(input: string): void {
    let data = input;
    for (const listener of this.listeners) {
      const result = listener(data);
      if (result?.consume) return;
      if (result?.data !== undefined) data = result.data;
    }
    if (data.length === 0) return;
    if (matchesKey(data, "shift+ctrl+d") && this.host.onDebug) {
      this.host.onDebug();
      return;
    }
    const focused = this.host.focusedComponent;
    if (!focused?.handleInput) return;
    if (isKeyRelease(data) && !focused.wantsKeyRelease) return;
    focused.handleInput(data);
    this.host.requestRender();
  }
}
