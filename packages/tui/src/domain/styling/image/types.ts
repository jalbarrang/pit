export interface CellDimensions { widthPx: number; heightPx: number }
export interface ImageDimensions { widthPx: number; heightPx: number }
export interface ImageCellSize { columns: number; rows: number }
export interface ImagePlaceholderInfo {
  mimeType: string;
  dimensions?: ImageDimensions;
  filename?: string;
  hint?: string;
}
