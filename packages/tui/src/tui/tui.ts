import { createCliRenderer, type RenderContext } from "@opentui/core";
import { applyFocusTransition, type FocusTarget, transitionFocus } from "../domain/composition/index.ts";
import { type Component } from "../components/index.ts";
import { KeyRouter } from "./key-routing.ts";
import { OverlayManager } from "./overlays.ts";
import type { DebugHandler, TuiConfig, TuiRenderer } from "./types.ts";
import type { InputListener, KeyEventLike, KeyEventSource } from "./key-source.ts";
import type { OverlayHandle, OverlayOptions } from "../domain/composition/index.ts";

export class TUI {
  readonly renderer: TuiRenderer;
  focusedComponent: Component | null = null;
  onDebug?: DebugHandler;
  private keyRouter: KeyRouter;
  private keySource: KeyEventSource | null;
  private overlays: OverlayManager;

  private constructor(renderer: TuiRenderer, keySource?: KeyEventSource) {
    this.renderer = renderer;
    this.overlays = new OverlayManager(this);
    this.keyRouter = new KeyRouter(this);
    this.keySource = keySource ?? renderer.keyInput ?? null;
    if (this.keySource) this.keyRouter.bind(this.keySource);
  }

  static async create(config: TuiConfig = {}): Promise<TUI> {
    if (config.renderer) return new TUI(config.renderer, config.keySource);
    const renderer = await createCliRenderer({ exitOnCtrlC: false, useMouse: true, enableMouseMovement: true });
    return new TUI(renderer as TuiRenderer, config.keySource);
  }

  get ctx(): RenderContext {
    return this.renderer as unknown as RenderContext;
  }

  addChild(component: Component): void {
    this.renderer.root.add(component.renderable);
    this.requestRender();
  }

  setFocus(component: Component | null): void {
    const transition = transitionFocus(this.focusedComponent as FocusTarget, component as FocusTarget);
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

  showOverlay(component: Component, options?: OverlayOptions): OverlayHandle {
    return this.overlays.showOverlay(component, options);
  }

  hideOverlay(): void {
    this.overlays.hideOverlay();
  }

  hasOverlay(): boolean {
    return this.overlays.hasOverlay();
  }

  stop(): void {
    if (this.keySource) this.keyRouter.unbind(this.keySource);
    this.overlays.destroy();
    this.renderer.destroy();
  }
}
