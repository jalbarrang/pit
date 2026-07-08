import { createCliRenderer } from "@opentui/core";
import { applyFocusTransition, transitionFocus } from "../domain/composition/index.ts";
import { type Component } from "../components/index.ts";
import type { DebugHandler, TuiConfig, TuiRenderer } from "./types.ts";

export class TUI {
  readonly renderer: TuiRenderer;
  focusedComponent: Component | null = null;
  onDebug?: DebugHandler;

  private constructor(renderer: TuiRenderer) {
    this.renderer = renderer;
  }

  static async create(config: TuiConfig = {}): Promise<TUI> {
    if (config.renderer) return new TUI(config.renderer);
    const renderer = await createCliRenderer({ exitOnCtrlC: false });
    return new TUI(renderer as TuiRenderer);
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

  stop(): void {
    this.renderer.destroy();
  }
}
