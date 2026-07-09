import type { ImageDimensions } from "./types.ts";

export const getWebpDimensions = (base64Data: string): ImageDimensions | null => {
  try {
    const b = Buffer.from(base64Data, "base64");
    if (b.length < 30 || b.subarray(0, 4).toString("ascii") !== "RIFF" || b.subarray(8, 12).toString("ascii") !== "WEBP") return null;
    const chunk = b.subarray(12, 16).toString("ascii");
    if (chunk === "VP8 ") return { widthPx: b.readUInt16LE(26) & 0x3fff, heightPx: b.readUInt16LE(28) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { widthPx: (bits & 0x3fff) + 1, heightPx: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === "VP8X") return { widthPx: (b[24] | (b[25] << 8) | (b[26] << 16)) + 1, heightPx: (b[27] | (b[28] << 8) | (b[29] << 16)) + 1 };
    return null;
  } catch {
    return null;
  }
};
