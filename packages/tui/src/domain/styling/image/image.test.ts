import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateImageCellSize, decodeImageData, formatImagePlaceholder, getGifDimensions, getImageDimensions, getPngDimensions, rasterizeImageData } from "./index.ts";

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 13]),
  Buffer.from("IHDR"),
  Buffer.from([0, 0, 0, 32, 0, 0, 0, 16, 8, 2, 0, 0, 0]),
]).toString("base64");

const gif = Buffer.from([...Buffer.from("GIF89a"), 5, 0, 7, 0]).toString("base64");

describe("image domain", () => {
  it("reads PNG and GIF header dimensions", () => {
    assert.deepEqual(getPngDimensions(png), { widthPx: 32, heightPx: 16 });
    assert.deepEqual(getGifDimensions(gif), { widthPx: 5, heightPx: 7 });
    assert.deepEqual(getImageDimensions(png, "image/png"), { widthPx: 32, heightPx: 16 });
  });

  it("matches pi terminal cell sizing math", () => {
    assert.deepEqual(calculateImageCellSize({ widthPx: 800, heightPx: 600 }, 40, undefined, { widthPx: 10, heightPx: 20 }), { columns: 40, rows: 15 });
    assert.deepEqual(calculateImageCellSize({ widthPx: 800, heightPx: 600 }, 40, 10, { widthPx: 10, heightPx: 20 }), { columns: 27, rows: 10 });
  });

  it("decodes PNG bytes to RGBA", () => {
    const encoded = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
    const decoded = decodeImageData(encoded, "image/png");
    assert.deepEqual(decoded, { widthPx: 1, heightPx: 1, rgba: new Uint8Array([255, 255, 255, 255]) });
  });

  it("maps decoded pixels to supersampled cell pixels", () => {
    const rgba = new Uint8Array([1, 0, 0, 255, 2, 0, 0, 255, 3, 0, 0, 255, 4, 0, 0, 255]);
    const raster = rasterizeImageData({ widthPx: 2, heightPx: 2, rgba }, { columns: 1, rows: 1 });
    assert.deepEqual([...raster.rgba.filter((_, i) => i % 4 === 0)], [1, 2, 3, 4]);
    assert.deepEqual({ pixelWidth: raster.pixelWidth, pixelHeight: raster.pixelHeight }, { pixelWidth: 2, pixelHeight: 2 });
  });

  it("formats a bordered external-viewer placeholder", () => {
    const lines = formatImagePlaceholder({ mimeType: "image/png", filename: "cat.png", dimensions: { widthPx: 32, heightPx: 16 } }, 30);
    assert.equal(lines.length, 5);
    assert.match(lines.join("\n"), /cat\.png/);
    assert.match(lines.join("\n"), /32×16/);
  });
});
