import { BoxRenderable, TextRenderable, createCliRenderer, type RenderContext, type TerminalCapabilities } from "@opentui/core";
import { Image } from "../src/components/image/index.ts";

const png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=";
const forceKitty = process.argv.includes("--kitty");

const withKitty = (ctx: RenderContext, kitty_graphics: boolean): RenderContext => new Proxy(ctx, {
  get(target, prop) {
    if (prop !== "capabilities") return Reflect.get(target, prop, target);
    return { ...(target.capabilities ?? {}), kitty_graphics } as TerminalCapabilities;
  },
}) as RenderContext;

const renderer = await createCliRenderer({ exitOnCtrlC: true, targetFps: 10 });
renderer.start();

const root = new BoxRenderable(renderer, {
  id: "image-parity-demo-box",
  border: true,
  width: 48,
  height: 9,
  padding: 1,
  flexDirection: "column",
});
renderer.root.add(root);
root.add(new TextRenderable(renderer, { content: `Image parity demo (${forceKitty ? "forced kitty" : "detected kitty"})` }));

const row = new BoxRenderable(renderer, { width: 44, height: 5, flexDirection: "row" });
root.add(row);
for (const [label, ctx] of [["quadrant", withKitty(renderer, false)], ["kitty", withKitty(renderer, forceKitty || renderer.capabilities?.kitty_graphics === true)]] as const) {
  const cell = new BoxRenderable(renderer, { width: 20, height: 5, flexDirection: "column", marginRight: 2 });
  cell.add(new TextRenderable(renderer, { content: label }));
  cell.add(new Image(ctx, { data: png, mimeType: "image/png", maxWidthCells: 4, terminalWrite: (data) => process.stdout.write(data) }).renderable);
  row.add(cell);
}

setInterval(() => renderer.requestRender(), 250);
const stop = () => {
  renderer.destroy();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
