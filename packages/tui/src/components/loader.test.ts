import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Renderable } from "@opentui/core";
import { CancellableLoader, Loader } from "./index.ts";

class FakeRenderable {
  content = "";
  requestRenderCount = 0;
  requestRender(): void { this.requestRenderCount++; }
  add(): number { return 0; }
  remove(): void {}
  getChildren(): Renderable[] { return []; }
  getChildrenCount(): number { return 0; }
}
const fake = () => new FakeRenderable() as unknown as Renderable & { content: string; requestRenderCount: number };

describe("Loader", () => {
  it("advances spinner frames and stops its timer", async () => {
    const renderable = fake();
    const loader = new Loader({} as never, undefined, undefined, "Work", { frames: ["a", "b", "c"], intervalMs: 5 }, renderable as never);
    loader.start();
    const first = renderable.content;
    await new Promise((resolve) => setTimeout(resolve, 7));
    const second = renderable.content;
    loader.stop();
    const stopped = renderable.content;
    await new Promise((resolve) => setTimeout(resolve, 12));
    assert.notEqual(first, second);
    assert.equal(renderable.content, stopped);
  });

  it("updates message text while running", () => {
    const renderable = fake();
    const loader = new Loader({} as never, undefined, undefined, "One", { frames: ["*"], intervalMs: 5 }, renderable as never);
    loader.setMessage("Two");
    assert.equal(renderable.content.includes("Two"), true);
  });
});

describe("CancellableLoader", () => {
  it("aborts and calls onCancel on escape", () => {
    const loader = new CancellableLoader({} as never, undefined, undefined, "Work", undefined, fake() as never);
    let cancelled = false;
    loader.onCancel = () => { cancelled = true; };
    loader.handleInput("\x1b");
    assert.equal(cancelled, true);
    assert.equal(loader.aborted, true);
  });
});
