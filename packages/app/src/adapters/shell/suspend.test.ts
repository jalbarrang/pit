import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { suspendToBackground, type SuspendDeps } from "./suspend.ts";

type Call = string;

describe("suspendToBackground", () => {
  it("suspends renderer, registers SIGCONT resume, then SIGTSTP on non-Windows", () => {
    const calls: Call[] = [];
    let contCb: (() => void) | undefined;
    const deps: SuspendDeps = {
      platform: "darwin",
      renderer: {
        suspend: () => void calls.push("renderer.suspend"),
        resume: () => void calls.push("renderer.resume"),
      },
      proc: {
        pid: 42,
        once: (signal, cb) => {
          calls.push(`proc.once:${signal}`);
          contCb = cb;
        },
        kill: (pid, signal) => void calls.push(`proc.kill:${pid}:${signal}`),
      },
      notify: (message) => void calls.push(`notify:${message}`),
    };
    suspendToBackground(deps);
    assert.deepEqual(calls, ["renderer.suspend", "proc.once:SIGCONT", "proc.kill:42:SIGTSTP"]);
    contCb?.();
    assert.deepEqual(calls, [
      "renderer.suspend",
      "proc.once:SIGCONT",
      "proc.kill:42:SIGTSTP",
      "renderer.resume",
    ]);
  });

  it("notifies and skips suspend/kill on win32", () => {
    const calls: Call[] = [];
    const deps: SuspendDeps = {
      platform: "win32",
      renderer: {
        suspend: () => void calls.push("renderer.suspend"),
        resume: () => void calls.push("renderer.resume"),
      },
      proc: {
        pid: 42,
        once: (signal, cb) => {
          calls.push(`proc.once:${signal}`);
          cb();
        },
        kill: (pid, signal) => void calls.push(`proc.kill:${pid}:${signal}`),
      },
      notify: (message) => void calls.push(`notify:${message}`),
    };
    suspendToBackground(deps);
    assert.deepEqual(calls, ["notify:Suspend is not supported on Windows"]);
  });
});
