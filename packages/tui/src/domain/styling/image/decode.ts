import { createRequire } from "node:module";
import type { DecodedImageData } from "./types.ts";

type Upng = {
  decode(data: ArrayBuffer): { width: number; height: number };
  toRGBA8(image: { width: number; height: number }): ArrayBuffer[];
};
type Jpeg = { decode(data: Uint8Array, options?: { useTArray?: boolean }): { width: number; height: number; data: Uint8Array } };

const require = createRequire(import.meta.url);
const UPNG = require("upng-js") as Upng;
const jpeg = require("jpeg-js") as Jpeg;

const toBytes = (base64Data: string): Uint8Array => new Uint8Array(Buffer.from(base64Data, "base64"));
const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const decodePng = (bytes: Uint8Array): DecodedImageData | null => {
  try {
    const image = UPNG.decode(toArrayBuffer(bytes));
    const frame = UPNG.toRGBA8(image)[0];
    if (!frame) return null;
    return { widthPx: image.width, heightPx: image.height, rgba: new Uint8Array(frame) };
  } catch {
    return null;
  }
};

const decodeJpeg = (bytes: Uint8Array): DecodedImageData | null => {
  try {
    const image = jpeg.decode(bytes, { useTArray: true });
    return { widthPx: image.width, heightPx: image.height, rgba: new Uint8Array(image.data) };
  } catch {
    return null;
  }
};

export const decodeImageData = (base64Data: string, mimeType: string): DecodedImageData | null => {
  const bytes = toBytes(base64Data);
  if (mimeType === "image/png") return decodePng(bytes);
  if (mimeType === "image/jpeg") return decodeJpeg(bytes);
  return null;
};
