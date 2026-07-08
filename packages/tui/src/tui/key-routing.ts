import { isKeyRelease, matchesKey } from "../domain/input/index.ts";
import type { Component } from "../components/index.ts";
import type { InputListener, KeyEventLike, KeyEventSource } from "./key-source.ts";

type RoutingHost = {
  focusedComponent: Component | null;
  onDebug?: () => void;
  requestRender: () => void;
};

export class KeyRouter {
  private listeners = new Set<InputListener>();
  private handler = (event: KeyEventLike) => this.handleKeyEvent(event);
  private host: RoutingHost;
  constructor(host: RoutingHost) {
    this.host = host;
  }

  bind(source: KeyEventSource): void {
    source.on("keypress", this.handler);
  }

  unbind(source: KeyEventSource): void {
    source.off("keypress", this.handler);
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
