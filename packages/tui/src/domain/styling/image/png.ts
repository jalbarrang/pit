import type { ImageDimensions } from "./types.ts";

export const getPngDimensions = (base64Data: string): ImageDimensions | null => {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 24) return null;
    if (buffer[0] !== 0x89 || buffer[1] !== 0x50 || buffer[2] !== 0x4e || buffer[3] !== 0x47) return null;
    return { widthPx: buffer.readUInt32BE(16), heightPx: buffer.readUInt32BE(20) };
  } catch {
    return null;
  }
};
