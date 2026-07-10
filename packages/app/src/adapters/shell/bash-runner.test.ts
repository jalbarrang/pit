import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BashRunner, type BashComponentHandle, type BashRunnerDeps } from "./bash-runner.ts";

function makeFake(overrides: Partial<BashRunnerDeps> = {}) {
  const calls: string[] = [];
  const handle: BashComponentHandle = {
    appendOutput: (chunk) => { calls.push(`append:${chunk}`); },
    setComplete: (exitCode, cancelled) => { calls.push(`complete:${String(exitCode)}:${cancelled}`); },
  };
  const deps: BashRunnerDeps = {
    hasBash: () => true,
    execute: async (cmd, onChunk, excluded) => {
      calls.push(`execute:${cmd}:${excluded}`);
      onChunk("out");
      return { exitCode: 0, cancelled: false };
    },
    addComponent: (cmd, excluded) => {
      calls.push(`add:${cmd}:${excluded}`);
      return handle;
    },
    notify: (t) => { calls.push(`notify:${t}`); },
    ...overrides,
  };
  return { deps, calls, handle };
}

describe("BashRunner", () => {
  it("notifies and skips execute/addComponent when bash unavailable", () => {
    const { deps, calls } = makeFake({ hasBash: () => false });
    new BashRunner(deps).run({ command: "ls", excluded: false });
    assert.deepEqual(calls, ["notify:Bash unavailable"]);
  });

  it("streams chunks to the component handle", async () => {
    const { deps, calls } = makeFake({
      execute: async (_cmd, onChunk) => {
        onChunk("a");
        onChunk("b");
        return { exitCode: 0, cancelled: false };
      },
    });
    new BashRunner(deps).run({ command: "echo", excluded: false });
    await Promise.resolve();
    assert.ok(calls.includes("append:a"));
    assert.ok(calls.includes("append:b"));
  });

  it("maps exitCode and cancelled on completion", async () => {
    const { deps, calls } = makeFake({
      execute: async () => ({ exitCode: 7, cancelled: true }),
    });
    new BashRunner(deps).run({ command: "x", excluded: false });
    await Promise.resolve();
    assert.ok(calls.includes("complete:7:true"));
  });

  it("passes excluded=true to execute", async () => {
    const { deps, calls } = makeFake();
    new BashRunner(deps).run({ command: "ls", excluded: true });
    await Promise.resolve();
    assert.ok(calls.includes("execute:ls:true"));
    assert.ok(calls.includes("add:ls:true"));
  });

  it("passes excluded=false to execute", async () => {
    const { deps, calls } = makeFake();
    new BashRunner(deps).run({ command: "ls", excluded: false });
    await Promise.resolve();
    assert.ok(calls.includes("execute:ls:false"));
    assert.ok(calls.includes("add:ls:false"));
  });

  it("notifies and setComplete(undefined,false) on rejection", async () => {
    const { deps, calls } = makeFake({
      execute: async () => { throw new Error("boom"); },
    });
    new BashRunner(deps).run({ command: "x", excluded: false });
    await Promise.resolve();
    await Promise.resolve();
    assert.ok(calls.includes("complete:undefined:false"));
    assert.ok(calls.includes("notify:Bash failed: boom"));
  });
});
