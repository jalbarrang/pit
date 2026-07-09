import type { RenderContext, TerminalCapabilities } from "@opentui/core";

export const canUseKittyGraphics = (capabilities: TerminalCapabilities | null | undefined): boolean =>
  capabilities?.kitty_graphics === true;

export const imageMaxWidth = (ctx: Pick<RenderContext, "width">, configured?: number): number =>
  Math.max(1, configured ?? ctx.width);
