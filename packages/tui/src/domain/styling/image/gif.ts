import { createRequire } from "node:module";
import type { DecodedImageData, ImageDimensions } from "./types.ts";

type GifReader = {
  width: number;
  height: number;
  numFrames(): number;
  decodeAndBlitFrameRGBA(frame: number, pixels: Uint8Array): void;
};
type Omggif = { GifReader: new (data: Uint8Array) => GifReader };

const require = createRequire(import.meta.url);
const { GifReader } = require("omggif") as Omggif;

const toGifBytes = (base64Data: string): Buffer => Buffer.from(base64Data, "base64");

export const getGifDimensions = (base64Data: string): ImageDimensions | null => {
  try {
    const buffer = toGifBytes(base64Data);
    if (buffer.length < 10) return null;
    const sig = buffer.subarray(0, 6).toString("ascii");
    if (sig !== "GIF87a" && sig !== "GIF89a") return null;
    return { widthPx: buffer.readUInt16LE(6), heightPx: buffer.readUInt16LE(8) };
  } catch {
    return null;
  }
};

export const decodeGifFirstFrame = (bytes: Uint8Array): DecodedImageData | null => {
  try {
    const reader = new GifReader(bytes);
    if (reader.numFrames() < 1) return null;
    const rgba = new Uint8Array(reader.width * reader.height * 4);
    reader.decodeAndBlitFrameRGBA(0, rgba);
    return { widthPx: reader.width, heightPx: reader.height, rgba };
  } catch {
    return null;
  }
};
