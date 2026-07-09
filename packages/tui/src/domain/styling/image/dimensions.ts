import { getGifDimensions } from "./gif.ts";
import { getJpegDimensions } from "./jpeg.ts";
import { getPngDimensions } from "./png.ts";
import { getWebpDimensions } from "./webp.ts";
import type { ImageDimensions } from "./types.ts";

export const getImageDimensions = (base64Data: string, mimeType: string): ImageDimensions | null => {
  if (mimeType === "image/png") return getPngDimensions(base64Data);
  if (mimeType === "image/jpeg") return getJpegDimensions(base64Data);
  if (mimeType === "image/gif") return getGifDimensions(base64Data);
  if (mimeType === "image/webp") return getWebpDimensions(base64Data);
  return null;
};
