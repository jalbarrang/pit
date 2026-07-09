import type { ImageDimensions } from "./types.ts";

export const getGifDimensions = (base64Data: string): ImageDimensions | null => {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 10) return null;
    const sig = buffer.subarray(0, 6).toString("ascii");
    if (sig !== "GIF87a" && sig !== "GIF89a") return null;
    return { widthPx: buffer.readUInt16LE(6), heightPx: buffer.readUInt16LE(8) };
  } catch {
    return null;
  }
};
