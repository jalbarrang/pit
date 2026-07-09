import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const gif4x4 = "R0lGODlhBAAEAPIEAAAAAP8AAAD/AAAA/////wAAAAAAAAAAACH5BAAAAAAALAAAAAAEAAQAAAMGGDIE/tAlADs=";
const webp4x4 = "UklGRjIAAABXRUJQVlA4TCYAAAAvA8AAACcgEEjaH3qN+RcQFPk/2vwHsqVsEAgQXpT43xIR0f80Bg==";

const runImageCase = (data: string, mimeType: string): string => {
  const script = `
    import { Image } from "./packages/tui/src/components/image/image.ts";
    const ctx = { width: 80, height: 30, capabilities: {}, requestRender() {}, addToHitGrid() {}, registerLifecyclePass() {} };
    const image = new Image(ctx, { data: ${JSON.stringify(data)}, mimeType: ${JSON.stringify(mimeType)}, filename: "fixture" });
    console.log(image.renderable.constructor.name);
  `;
  const result = spawnSync(process.execPath, ["--experimental-ffi", "--input-type=module", "--eval", script], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
};

describe("Image render path", () => {
  it("renders GIF and WebP through decoded frames, not the placeholder", () => {
    assert.equal(runImageCase(gif4x4, "image/gif"), "FrameBufferRenderable");
    assert.equal(runImageCase(webp4x4, "image/webp"), "FrameBufferRenderable");
  });

  it("keeps corrupt image data on the placeholder path", () => {
    assert.equal(runImageCase("not-image", "image/gif"), "BoxRenderable");
    assert.equal(runImageCase("not-image", "image/webp"), "BoxRenderable");
  });
});
