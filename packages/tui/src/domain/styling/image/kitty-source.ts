import { decodeImageData } from "./decode.ts";
import { getPngDimensions } from "./png.ts";
import type { KittyImageSource } from "./kitty-placeholder.ts";
import type { ImageDimensions } from "./types.ts";

export interface KittyPreparedImage { source: KittyImageSource; dimensions: ImageDimensions }

const toBytes = (base64Data: string): Uint8Array => new Uint8Array(Buffer.from(base64Data, "base64"));

export const prepareKittyImage = (base64Data: string, mimeType: string): KittyPreparedImage | null => {
  const bytes = toBytes(base64Data);
  if (mimeType === "image/png") {
    const dimensions = getPngDimensions(base64Data);
    return dimensions ? { source: { format: "png", data: bytes }, dimensions } : null;
  }
  const decoded = decodeImageData(base64Data, mimeType);
  if (!decoded) return null;
  return { source: { format: "rgba", widthPx: decoded.widthPx, heightPx: decoded.heightPx, data: decoded.rgba }, dimensions: decoded };
};
