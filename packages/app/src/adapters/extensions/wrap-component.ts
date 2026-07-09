import type { RenderContext } from "@opentui/core";
import { AnsiBridge, hasRenderable, isLegacyComponent, type Component, type LegacyComponent } from "@pit/tui";

/** Duck-type: native pit Component passes through; legacy render(width) wraps in AnsiBridge. */
export function wrapExtensionComponent(ctx: RenderContext, value: unknown): Component | undefined {
  if (value == null) return undefined;
  if (hasRenderable(value)) return value;
  if (isLegacyComponent(value)) return new AnsiBridge(ctx, value as LegacyComponent);
  if (Array.isArray(value)) {
    const lines = value as string[];
    return new AnsiBridge(ctx, { render: () => lines });
  }
  return undefined;
}
