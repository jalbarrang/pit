import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toImageContent } from "./to-image-content.ts";

describe("toImageContent", () => {
  it("maps data and mimeType, sets type image, drops filename", () => {
    const result = toImageContent({
      data: "abc",
      mimeType: "image/png",
      filename: "x.png",
    });
    assert.deepEqual(result, { type: "image", data: "abc", mimeType: "image/png" });
    assert.equal("filename" in result, false);
  });
});
