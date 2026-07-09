import type { RenderContext, TerminalCapabilities } from "@opentui/core";

export const canUseKittyGraphics = (capabilities: TerminalCapabilities | null | undefined): boolean =>
  capabilities?.kitty_graphics === true;

/** Sensible defaults so a large image never floods the viewport (pi caps tool images similarly). */
const DEFAULT_MAX_WIDTH_CELLS = 72;
const DEFAULT_MAX_HEIGHT_CELLS = 24;
const WIDTH_MARGIN_CELLS = 2;
const HEIGHT_VIEWPORT_RATIO = 0.6;

export interface ImageCellLimits {
  maxWidth: number;
  maxHeight: number;
}

export interface ImageSizeOptions {
  maxWidthCells?: number;
  maxHeightCells?: number;
}

/**
 * Resolve the cell bounds an inline image may occupy. Explicit options win;
 * defaults are capped at 72x24 and further bounded by the terminal size
 * (width minus a small margin, height at ~60% of the viewport).
 */
export const imageCellLimits = (ctx: Pick<RenderContext, "width" | "height">, options?: ImageSizeOptions): ImageCellLimits => {
  const maxWidth = options?.maxWidthCells ?? Math.min(DEFAULT_MAX_WIDTH_CELLS, ctx.width - WIDTH_MARGIN_CELLS);
  const maxHeight = options?.maxHeightCells ?? Math.min(DEFAULT_MAX_HEIGHT_CELLS, Math.floor(ctx.height * HEIGHT_VIEWPORT_RATIO));
  return { maxWidth: Math.max(1, Math.floor(maxWidth)), maxHeight: Math.max(1, Math.floor(maxHeight)) };
};
