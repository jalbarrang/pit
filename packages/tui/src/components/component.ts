import type { Renderable } from "@opentui/core";

export abstract class Component {
  abstract readonly renderable: Renderable;
  handleInput?(data: string): void;
  wantsKeyRelease?: boolean;
  invalidate(): void {
    this.renderable.requestRender();
  }
}

export interface Focusable {
  focused: boolean;
}

export function isFocusable(component: Component | null): component is Component & Focusable {
  return component !== null && "focused" in component;
}
