import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PendingImages } from "./pending-images.ts";
import type { ImagePart } from "../../domain/index.ts";

const img = (n: number): ImagePart => ({
  data: `d${n}`,
  mimeType: "image/png",
  filename: `f${n}.png`,
});

describe("PendingImages", () => {
  it("push returns growing count and count reflects state", () => {
    const pending = new PendingImages();
    assert.equal(pending.count, 0);
    assert.equal(pending.push(img(1)), 1);
    assert.equal(pending.count, 1);
    assert.equal(pending.push(img(2)), 2);
    assert.equal(pending.count, 2);
  });

  it("takeAll returns all then empties", () => {
    const pending = new PendingImages();
    pending.push(img(1));
    pending.push(img(2));
    assert.deepEqual(pending.takeAll(), [img(1), img(2)]);
    assert.equal(pending.count, 0);
    assert.deepEqual(pending.takeAll(), []);
  });
});
