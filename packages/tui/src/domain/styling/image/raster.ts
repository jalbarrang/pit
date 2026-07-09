import type { DecodedImageData, ImageCellSize, RasterizedImageData } from "./types.ts";

const sourceOffset = (image: DecodedImageData, x: number, y: number): number => {
  const sx = Math.min(image.widthPx - 1, Math.floor((x * image.widthPx) / Math.max(1, image.widthPx)));
  const sy = Math.min(image.heightPx - 1, Math.floor((y * image.heightPx) / Math.max(1, image.heightPx)));
  return (sy * image.widthPx + sx) * 4;
};

const scaledSourceOffset = (image: DecodedImageData, x: number, y: number, width: number, height: number): number => {
  const sx = Math.min(image.widthPx - 1, Math.floor((x * image.widthPx) / width));
  const sy = Math.min(image.heightPx - 1, Math.floor((y * image.heightPx) / height));
  return (sy * image.widthPx + sx) * 4;
};

export const rasterizeImageData = (image: DecodedImageData, cells: ImageCellSize): RasterizedImageData => {
  const pixelWidth = Math.max(1, cells.columns * 2);
  const pixelHeight = Math.max(1, cells.rows * 2);
  const rgba = new Uint8Array(pixelWidth * pixelHeight * 4);
  for (let y = 0; y < pixelHeight; y++) {
    for (let x = 0; x < pixelWidth; x++) {
      const from = image.widthPx === pixelWidth && image.heightPx === pixelHeight
        ? sourceOffset(image, x, y)
        : scaledSourceOffset(image, x, y, pixelWidth, pixelHeight);
      const to = (y * pixelWidth + x) * 4;
      rgba[to] = image.rgba[from] ?? 0;
      rgba[to + 1] = image.rgba[from + 1] ?? 0;
      rgba[to + 2] = image.rgba[from + 2] ?? 0;
      rgba[to + 3] = image.rgba[from + 3] ?? 255;
    }
  }
  return { ...cells, pixelWidth, pixelHeight, rgba };
};
