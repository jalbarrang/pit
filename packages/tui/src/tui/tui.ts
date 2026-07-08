import { createCliRenderer } from "@opentui/core";
import { applyFocusTransition, transitionFocus } from "../domain/composition/index.ts";
import { type Component } from "../components/index.ts";
import { KeyRouter } from "./key-routing.ts";
import type { DebugHandler, TuiConfig, TuiRenderer } from "./types.ts";
import type { InputListener, KeyEventLike, KeyEventSource } from "./key-source.ts";

export class TUI {
  readonly renderer: TuiRenderer;
  focusedComponent: Component | null = null;
  onDebug?: DebugHandler;
  private keyRouter: KeyRouter;
  private keySource: KeyEventSource | null;

  private constructor(renderer: TuiRenderer, keySource?: KeyEventSource) {
    this.renderer = renderer;
    this.keyRouter = new KeyRouter(this);
    this.keySource = keySource ?? renderer.keyInput ?? null;
    if (this.keySource) this.keyRouter.bind(this.keySource);
  }

  static async create(config: TuiConfig = {}): Promise<TUI> {
    if (config.renderer) return new TUI(config.renderer, config.keySource);
    const renderer = await createCliRenderer({ exitOnCtrlC: false });
    return new TUI(renderer as TuiRenderer, config.keySource);
  }

  addChild(component: Component): void {
    this.renderer.root.add(component.renderable);
    this.requestRender();
  }

  setFocus(component: Component | null): void {
    const transition = transitionFocus(this.focusedComponent, component);
    if (!transition.changed) return;
    applyFocusTransition(transition);
    this.focusedComponent = component;
    this.requestRender();
  }

  requestRender(_force = false): void {
    this.renderer.requestRender();
  }

  addInputListener(listener: InputListener): () => void {
    return this.keyRouter.addInputListener(listener);
  }

  removeInputListener(listener: InputListener): void {
    this.keyRouter.removeInputListener(listener);
  }

  routeKeyEvent(event: KeyEventLike): void {
    this.keyRouter.handleKeyEvent(event);
  }

  stop(): void {
    if (this.keySource) this.keyRouter.unbind(this.keySource);
    this.renderer.destroy();
  }
}
