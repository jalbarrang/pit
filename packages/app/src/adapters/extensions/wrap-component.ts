import type { RenderContext, Renderable, StyledText } from "@opentui/core";
import { AnsiBridge, hasRenderable, isLegacyComponent, Text, type Component, type LegacyComponent } from "@pit/tui";

export type LineFactory = (ctx: RenderContext, content: StyledText) => Text;

export interface WrapInject {
  box?: Renderable & { options?: Record<string, unknown> };
  makeLine?: LineFactory;
}

/** Duck-type: native pit Component passes through; legacy render(width) wraps in AnsiBridge. */
export function wrapExtensionComponent(ctx: RenderContext, value: unknown, inject?: WrapInject): Component | undefined {
  if (value == null) return undefined;
  if (hasRenderable(value)) return value;
  if (isLegacyComponent(value)) return new AnsiBridge(ctx, value as LegacyComponent, inject?.box, inject?.makeLine);
  if (Array.isArray(value)) {
    return new AnsiBridge(ctx, { render: () => value as string[] }, inject?.box, inject?.makeLine);
  }
  return undefined;
}
