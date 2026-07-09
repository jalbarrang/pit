import { BoxRenderable, ScrollBoxRenderable, TextRenderable, createCliRenderer } from "@opentui/core";
import { setTimeout as sleep } from "node:timers/promises";

const seconds = Number(process.env.PIT_STRESS_SECONDS ?? 20);
const renderer = await createCliRenderer({ exitOnCtrlC: false, gatherStats: true, targetFps: 60, maxFps: 60, useMouse: false });
const scroll = new ScrollBoxRenderable(renderer, { width: "100%", height: "100%", scrollY: true, contentOptions: { flexDirection: "column", width: "100%" } });
renderer.root.add(scroll);

const addBox = (title: string, body: string) => {
  const box = new BoxRenderable(renderer, { flexDirection: "column", width: "100%", height: "auto", paddingX: 1, paddingY: 0 });
  box.add(new TextRenderable(renderer, { content: title, width: "100%", height: "auto" }));
  box.add(new TextRenderable(renderer, { content: body, width: "100%", height: "auto", wrapMode: "word" }));
  scroll.add(box);
};

for (let i = 0; i < 500; i++) {
  addBox(i % 2 ? `assistant ${i}` : `user ${i}`, `markdown **${i}**\n- item\n\nTool box: ${"x".repeat(90)}`);
}

const stream = new TextRenderable(renderer, { content: "assistant stream:", width: "100%", height: "auto", wrapMode: "word" });
scroll.add(stream);
renderer.start();
renderer.resetStats();
const started = performance.now();
let token = 0;
while (performance.now() - started < seconds * 1000) {
  token++;
  stream.content = `${stream.content} token${token}`;
  renderer.requestRender();
  await sleep(1000 / 60);
}
await sleep(200);
const stats = renderer.getStats();
const memory = process.memoryUsage();
renderer.destroy();
console.log(JSON.stringify({ seconds, tokens: token, frames: stats.frameCount, averageFrameMs: stats.averageFrameTime, worstFrameMs: stats.maxFrameTime, rssMb: Math.round(memory.rss / 1024 / 1024), heapMb: Math.round(memory.heapUsed / 1024 / 1024) }, null, 2));
process.exit(0);
