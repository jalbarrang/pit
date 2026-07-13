import type { Renderable } from "@opentui/core";
import { SelectorOverlay } from "./selector-overlay.ts";

export class FakeRenderable {
  content = "";
  visible = true;
  options: Record<string, unknown> = {};
  requestRender(): void {}
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}

export const overlayItems = [
  { value: "anthropic/claude-opus-4-8", label: "anthropic/claude-opus-4-8" },
  { value: "openai/gpt-5.5", label: "openai/gpt-5.5" },
  { value: "cursor/composer-2.5", label: "cursor/composer-2.5" },
];

export const makeOverlay = (options: { searchable?: boolean; initialSearch?: string; initialIndex?: number; header?: string } = {}) => {
  const selected: string[] = [];
  let cancelled = 0;
  const overlay = new SelectorOverlay({} as never, { items: overlayItems, initialIndex: options.initialIndex ?? 0, ...options }, {
    box: new FakeRenderable() as never,
    list: new FakeRenderable() as never,
    search: new FakeRenderable() as never,
    header: new FakeRenderable() as never,
  });
  overlay.onSelect = (item) => void selected.push(item.value);
  overlay.onCancel = () => void (cancelled += 1);
  return { overlay, selected, cancelled: () => cancelled };
};
