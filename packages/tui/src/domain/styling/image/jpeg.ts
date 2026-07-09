import type { ImageDimensions } from "./types.ts";

export const getJpegDimensions = (base64Data: string): ImageDimensions | null => {
  try {
    const buffer = Buffer.from(base64Data, "base64");
    if (buffer.length < 2 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
    let offset = 2;
    while (offset < buffer.length - 9) {
      if (buffer[offset] !== 0xff) { offset++; continue; }
      const marker = buffer[offset + 1];
      if (marker >= 0xc0 && marker <= 0xc2) return { heightPx: buffer.readUInt16BE(offset + 5), widthPx: buffer.readUInt16BE(offset + 7) };
      if (offset + 3 >= buffer.length) return null;
      const length = buffer.readUInt16BE(offset + 2);
      if (length < 2) return null;
      offset += 2 + length;
    }
    return null;
  } catch {
    return null;
  }
};
