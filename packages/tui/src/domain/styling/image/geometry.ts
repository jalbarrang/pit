import type { CellDimensions, ImageCellSize, ImageDimensions } from "./types.ts";

const clampCells = (value: number): number => Math.max(1, Math.floor(value));

export const calculateImageCellSize = (
  image: ImageDimensions,
  maxWidthCells: number,
  maxHeightCells?: number,
  cell: CellDimensions = { widthPx: 9, heightPx: 18 },
): ImageCellSize => {
  const maxWidth = clampCells(maxWidthCells);
  const maxHeight = maxHeightCells === undefined ? undefined : clampCells(maxHeightCells);
  const imageWidth = Math.max(1, image.widthPx);
  const imageHeight = Math.max(1, image.heightPx);
  const widthScale = (maxWidth * cell.widthPx) / imageWidth;
  const heightScale = maxHeight === undefined ? widthScale : (maxHeight * cell.heightPx) / imageHeight;
  const scale = Math.min(widthScale, heightScale);
  const columns = Math.ceil((imageWidth * scale) / cell.widthPx);
  const rows = Math.ceil((imageHeight * scale) / cell.heightPx);
  return { columns: Math.max(1, Math.min(maxWidth, columns)), rows: Math.max(1, maxHeight === undefined ? rows : Math.min(maxHeight, rows)) };
};

export const calculateImageRows = (image: ImageDimensions, targetWidthCells: number, cell?: CellDimensions): number =>
  calculateImageCellSize(image, targetWidthCells, undefined, cell).rows;
