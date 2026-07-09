import { BoxRenderable, FrameBufferRenderable, RGBA, TextRenderable, createCliRenderer } from "@opentui/core";
import { Image } from "../src/components/image/index.ts";

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const rgba = new Uint8Array([
  255, 0, 0, 255, 0, 255, 0, 255,
  0, 0, 255, 255, 255, 255, 0, 255,
]);

const renderer = await createCliRenderer({ exitOnCtrlC: true, targetFps: 10 });
renderer.start();

const box = new BoxRenderable(renderer, {
  id: "image-raster-demo-box",
  border: true,
  width: 28,
  height: 8,
  padding: 1,
  flexDirection: "column",
});
renderer.root.add(box);

box.add(new TextRenderable(renderer, { content: "RGBA quadrant demo" }));
const frame = new FrameBufferRenderable(renderer, { width: 1, height: 1, respectAlpha: false });
frame.frameBuffer.drawSuperSampleBuffer(0, 0, rgba, rgba.byteLength, "rgba8unorm", 8);
box.add(frame);
box.add(new TextRenderable(renderer, { content: "Expect one quadrant cell" }));
box.add(new Image(renderer, { data: png, mimeType: "image/png", maxWidthCells: 1 }).renderable);

setInterval(() => renderer.requestRender(), 250);
const stop = () => {
  renderer.destroy();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
