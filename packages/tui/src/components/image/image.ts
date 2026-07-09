import { FrameBufferRenderable, type OptimizedBuffer, type RenderContext, type Renderable } from "@opentui/core";
import { calculateImageCellSize, decodeImageData, getImageDimensions, rasterizeImageData, type ImageDimensions } from "../../domain/styling/index.ts";
import type { TerminalWrite } from "../../adapters/terminal-write.ts";
import { Component } from "../component.ts";
import { ImagePlaceholder } from "./image-placeholder.ts";
import { canUseKittyGraphics, imageCellLimits } from "./image-mode.ts";
import { createKittyImage } from "./kitty-image.ts";

export interface ImageOptions {
  data: string;
  mimeType: string;
  dimensions?: ImageDimensions;
  filename?: string;
  hint?: string;
  maxWidthCells?: number;
  maxHeightCells?: number;
  terminalWrite?: TerminalWrite;
}

type FrameLike = Renderable & { frameBuffer: OptimizedBuffer; options?: Record<string, unknown> };

const drawRaster = (target: FrameLike, raster: ReturnType<typeof rasterizeImageData>): void => {
  target.frameBuffer.drawSuperSampleBuffer(0, 0, raster.rgba as never, raster.rgba.byteLength, "rgba8unorm", raster.pixelWidth * 4);
};

const createFrame = (ctx: RenderContext, options: ImageOptions): FrameLike | null => {
  const decoded = decodeImageData(options.data, options.mimeType);
  if (!decoded) return null;
  const limits = imageCellLimits(ctx, options);
  const cells = calculateImageCellSize(decoded, limits.maxWidth, limits.maxHeight);
  const raster = rasterizeImageData(decoded, cells);
  const frame = new FrameBufferRenderable(ctx, {
    width: cells.columns,
    height: cells.rows,
    respectAlpha: false,
  }) as FrameLike;
  drawRaster(frame, raster);
  return frame;
};

export class Image extends Component {
  readonly renderable: Renderable;
  private readonly disposeKitty?: () => void;

  constructor(ctx: RenderContext, options: ImageOptions) {
    super();
    if (canUseKittyGraphics(ctx.capabilities)) {
      const kitty = createKittyImage(ctx, options, options.terminalWrite);
      if (kitty) {
        this.renderable = kitty.renderable;
        this.disposeKitty = kitty.dispose;
        return;
      }
    }
    const frame = createFrame(ctx, options);
    if (frame) {
      this.renderable = frame;
      return;
    }
    const dimensions = options.dimensions ?? getImageDimensions(options.data, options.mimeType) ?? undefined;
    this.renderable = new ImagePlaceholder(ctx, { ...options, dimensions }).renderable;
  }

  dispose(): void {
    this.disposeKitty?.();
  }
}
