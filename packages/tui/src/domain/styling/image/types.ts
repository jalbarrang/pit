export interface CellDimensions { widthPx: number; heightPx: number }
export interface ImageDimensions { widthPx: number; heightPx: number }
export interface ImageCellSize { columns: number; rows: number }
export interface DecodedImageData extends ImageDimensions { rgba: Uint8Array }
export interface RasterizedImageData extends ImageCellSize { pixelWidth: number; pixelHeight: number; rgba: Uint8Array }
export interface ImagePlaceholderInfo {
  mimeType: string;
  dimensions?: ImageDimensions;
  filename?: string;
  hint?: string;
}
