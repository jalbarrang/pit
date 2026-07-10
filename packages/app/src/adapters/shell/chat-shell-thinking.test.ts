import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChatShell } from "./chat-shell.ts";

const shellWithThinking = () => {
  const shell = Object.create(ChatShell.prototype) as any;
  shell.thinkingBlocks = [];
  shell.thinkingVisible = false;
  return shell as ChatShell;
};

describe("ChatShell thinking registry", () => {
  it("registerThinking applies current visibility and setThinkingVisible syncs all", () => {
    const shell = shellWithThinking();
    const states: boolean[] = [];
    const block = { setExpanded: (v: boolean) => void states.push(v) };
    shell.registerThinking(block);
    assert.deepEqual(states, [false]);
    assert.equal(shell.isThinkingVisible(), false);
    shell.setThinkingVisible(true);
    assert.deepEqual(states, [false, true]);
    assert.equal(shell.isThinkingVisible(), true);
    shell.registerThinking({ setExpanded: (v: boolean) => void states.push(v) });
    assert.deepEqual(states, [false, true, true]);
  });
});
