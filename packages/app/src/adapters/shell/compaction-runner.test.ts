import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CompactionRunner, type CompactionRunnerDeps } from "./compaction-runner.ts";

function makeFake(overrides: Partial<CompactionRunnerDeps> = {}) {
  const calls: string[] = [];
  const deps: CompactionRunnerDeps = {
    isCompacting: () => false,
    canCompact: () => true,
    compact: async (instructions) => {
      calls.push(`compact:${instructions === undefined ? "undefined" : instructions}`);
      return {};
    },
    prompt: async (text) => { calls.push(`prompt:${text}`); },
    notify: (t) => { calls.push(`notify:${t}`); },
    ...overrides,
  };
  return { deps, calls };
}

describe("CompactionRunner", () => {
  it("gate queues when compacting and does not prompt", () => {
    const { deps, calls } = makeFake({ isCompacting: () => true });
    const runner = new CompactionRunner(deps);
    assert.equal(runner.gate("hello"), true);
    assert.deepEqual(calls, ["notify:Queued until compaction finishes"]);
    assert.ok(!calls.some((c) => c.startsWith("prompt:")));
  });

  it("gate returns false when idle", () => {
    const { deps, calls } = makeFake({ isCompacting: () => false });
    assert.equal(new CompactionRunner(deps).gate("hello"), false);
    assert.deepEqual(calls, []);
  });

  it("flush prompts queued texts in order then empties", async () => {
    const { deps, calls } = makeFake({ isCompacting: () => true });
    const runner = new CompactionRunner(deps);
    runner.gate("a");
    runner.gate("b");
    runner.flush();
    for (let i = 0; i < 4; i++) await Promise.resolve();
    assert.deepEqual(
      calls.filter((c) => c.startsWith("prompt:")),
      ["prompt:a", "prompt:b"],
    );
    runner.flush();
    for (let i = 0; i < 4; i++) await Promise.resolve();
    assert.deepEqual(
      calls.filter((c) => c.startsWith("prompt:")),
      ["prompt:a", "prompt:b"],
    );
  });

  it("runCompact notifies when compaction unavailable", () => {
    const { deps, calls } = makeFake({ canCompact: () => false });
    new CompactionRunner(deps).runCompact("keep goals");
    assert.deepEqual(calls, ["notify:Compaction unavailable"]);
  });

  it("runCompact passes trimmed instructions; empty becomes undefined", async () => {
    const { deps, calls } = makeFake();
    const runner = new CompactionRunner(deps);
    runner.runCompact("  keep goals  ");
    await Promise.resolve();
    assert.ok(calls.includes("compact:keep goals"));
    runner.runCompact("   ");
    await Promise.resolve();
    assert.ok(calls.includes("compact:undefined"));
  });

  it("runCompact notifies on rejection", async () => {
    const { deps, calls } = makeFake({
      compact: async () => { throw new Error("boom"); },
    });
    new CompactionRunner(deps).runCompact("");
    await Promise.resolve();
    await Promise.resolve();
    assert.ok(calls.includes("notify:Compaction failed: boom"));
  });
});
