import type { Component } from "../component.ts";

/** Legacy pi-tui-style string component. */
export interface LegacyComponent {
  render(width: number): string[];
  handleInput?(data: string): void;
  invalidate?(): void;
  wantsKeyRelease?: boolean;
  focused?: boolean;
}

export function isLegacyComponent(value: unknown): value is LegacyComponent {
  return typeof value === "object" && value !== null && typeof (value as LegacyComponent).render === "function";
}

export function hasRenderable(value: unknown): value is Component {
  return typeof value === "object" && value !== null && "renderable" in value;
}
