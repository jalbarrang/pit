import { resolveOverlayLayout, topVisibleCapturingOverlay, type OverlayHandle, type OverlayOptions } from "../domain/composition/index.ts";
import type { Component } from "../components/index.ts";
import type { TuiRenderer } from "./types.ts";
type Entry = { component: Component; options?: OverlayOptions; preFocus: Component | null; hidden: boolean; focusOrder: number };
type Host = { renderer: TuiRenderer; focusedComponent: Component | null; setFocus(component: Component | null): void; requestRender(): void };
export class OverlayManager {
  private entries: Entry[] = [];
  private focusOrder = 0;
  private host: Host;
  private resizeHandler = () => this.positionAll();
  constructor(host: Host) {
    this.host = host;
    this.host.renderer.on?.("resize", this.resizeHandler);
  }
  showOverlay(component: Component, options?: OverlayOptions): OverlayHandle {
    const entry = { component, options, preFocus: this.host.focusedComponent, hidden: false, focusOrder: ++this.focusOrder };
    this.entries.push(entry);
    this.host.renderer.root.add(component.renderable);
    this.position(entry);
    if (!options?.nonCapturing && this.isVisible(entry)) this.host.setFocus(component);
    this.host.requestRender();
    return this.handle(entry);
  }
  hideOverlay(): void {
    const entry = this.entries.at(-1);
    if (entry) this.remove(entry);
  }
  hasOverlay(): boolean {
    return this.entries.some((entry) => this.isVisible(entry));
  }
  destroy(): void {
    this.host.renderer.off?.("resize", this.resizeHandler);
  }
  private handle(entry: Entry): OverlayHandle {
    return {
      hide: () => this.remove(entry),
      setHidden: (hidden) => this.setHidden(entry, hidden),
      isHidden: () => entry.hidden,
      focus: () => this.focus(entry),
      unfocus: (options) => this.host.setFocus((options?.target as Component | null | undefined) ?? this.nextFocus(entry)),
      isFocused: () => this.host.focusedComponent === entry.component,
    };
  }
  private remove(entry: Entry): void {
    const index = this.entries.indexOf(entry);
    if (index < 0) return;
    this.entries.splice(index, 1);
    this.host.renderer.root.remove?.(entry.component.renderable);
    if (this.host.focusedComponent === entry.component) this.host.setFocus(this.nextFocus(entry));
    this.host.requestRender();
  }
  private setHidden(entry: Entry, hidden: boolean): void {
    if (entry.hidden === hidden) return;
    entry.hidden = hidden;
    entry.component.renderable.visible = !hidden && this.isVisible(entry);
    if (hidden && this.host.focusedComponent === entry.component) this.host.setFocus(this.nextFocus(entry));
    if (!hidden && !entry.options?.nonCapturing && this.isVisible(entry)) this.focus(entry);
    this.host.requestRender();
  }
  private focus(entry: Entry): void {
    if (!this.entries.includes(entry) || !this.isVisible(entry)) return;
    entry.focusOrder = ++this.focusOrder;
    this.position(entry);
    this.host.setFocus(entry.component);
  }
  private nextFocus(excluding: Entry): Component | null {
    const candidates = this.entries.filter((entry) => entry !== excluding).map((entry) => ({ target: entry.component, hidden: entry.hidden, nonCapturing: entry.options?.nonCapturing, visible: this.isVisible(entry), focusOrder: entry.focusOrder }));
    return topVisibleCapturingOverlay(candidates) ?? excluding.preFocus;
  }
  private isVisible(entry: Entry): boolean {
    if (entry.hidden) return false;
    return entry.options?.visible ? entry.options.visible(this.host.renderer.width, this.host.renderer.height) : true;
  }
  private positionAll(): void {
    for (const entry of this.entries) this.position(entry);
  }
  private position(entry: Entry): void {
    const renderable = entry.component.renderable;
    const height = Math.max(1, Number(renderable.height) || 1);
    const layout = resolveOverlayLayout(entry.options, height, this.host.renderer.width, this.host.renderer.height);
    renderable.position = "absolute";
    renderable.left = layout.col;
    renderable.top = layout.row;
    renderable.width = layout.width;
    if (layout.maxHeight !== undefined) renderable.maxHeight = layout.maxHeight;
    renderable.zIndex = 1000 + entry.focusOrder;
    renderable.visible = this.isVisible(entry);
  }
}
