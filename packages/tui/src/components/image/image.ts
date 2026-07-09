import { FrameBufferRenderable, type OptimizedBuffer, type RenderContext, type Renderable } from "@opentui/core";
import { calculateImageCellSize, decodeImageData, getImageDimensions, rasterizeImageData, type ImageDimensions } from "../../domain/styling/index.ts";
import { Component } from "../component.ts";
import { ImagePlaceholder } from "./image-placeholder.ts";

export interface ImageOptions {
  data: string;
  mimeType: string;
  dimensions?: ImageDimensions;
  filename?: string;
  hint?: string;
  maxWidthCells?: number;
  maxHeightCells?: number;
}

type FrameLike = Renderable & { frameBuffer: OptimizedBuffer; options?: Record<string, unknown> };

const drawRaster = (target: FrameLike, raster: ReturnType<typeof rasterizeImageData>): void => {
  target.frameBuffer.drawSuperSampleBuffer(0, 0, raster.rgba as never, raster.rgba.byteLength, "rgba8unorm", raster.pixelWidth * 4);
};

const createFrame = (ctx: RenderContext, options: ImageOptions): FrameLike | null => {
  const decoded = decodeImageData(options.data, options.mimeType);
  if (!decoded) return null;
  const maxWidth = Math.max(1, options.maxWidthCells ?? 60);
  const defaultMaxHeight = Math.max(1, Math.ceil(maxWidth / 2));
  const cells = calculateImageCellSize(decoded, maxWidth, options.maxHeightCells ?? defaultMaxHeight);
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

  constructor(ctx: RenderContext, options: ImageOptions) {
    super();
    const frame = createFrame(ctx, options);
    if (frame) {
      this.renderable = frame;
      return;
    }
    const dimensions = options.dimensions ?? getImageDimensions(options.data, options.mimeType) ?? undefined;
    this.renderable = new ImagePlaceholder(ctx, { ...options, dimensions }).renderable;
  }
}
