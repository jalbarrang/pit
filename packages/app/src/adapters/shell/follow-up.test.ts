import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { QueuedMessages } from "../../domain/keybindings/message-queue.ts";
import { FollowUpController, type FollowUpDeps } from "./follow-up.ts";

type Call = string;

function makeFake(overrides: Partial<FollowUpDeps> & {
  text?: string;
  streaming?: boolean;
  session?: boolean;
  queue?: QueuedMessages;
  clearResult?: QueuedMessages | undefined;
} = {}) {
  const calls: Call[] = [];
  const state = {
    text: overrides.text ?? "hello",
    queue: overrides.queue ?? { steering: [] as string[], followUp: [] as string[] },
  };
  let resolvePrompt!: () => void;
  const promptPromise = new Promise<void>((resolve) => { resolvePrompt = resolve; });
  const deps: FollowUpDeps = {
    editorText: () => state.text,
    setEditorText: (t) => { calls.push(`setEditorText:${t}`); state.text = t; },
    isStreaming: () => overrides.streaming ?? false,
    hasSession: () => overrides.session ?? true,
    promptFollowUp: (t) => { calls.push(`promptFollowUp:${t}`); return promptPromise; },
    submit: (t) => { calls.push(`submit:${t}`); },
    queued: () => state.queue,
    clearQueue: () => {
      calls.push("clearQueue");
      if ("clearResult" in overrides) return overrides.clearResult;
      const q = state.queue;
      state.queue = { steering: [], followUp: [] };
      return q;
    },
    showPending: (lines) => { calls.push(`showPending:${JSON.stringify(lines)}`); },
    ...overrides,
  };
  return { deps, calls, state, resolvePrompt };
}

describe("FollowUpController", () => {
  it("streaming path clears editor, prompts follow-up, refreshes after resolve", async () => {
    const { deps, calls, resolvePrompt } = makeFake({
      text: "  queued msg  ",
      streaming: true,
      session: true,
      queue: { steering: [], followUp: ["queued msg"] },
    });
    new FollowUpController(deps).followUp();
    assert.ok(calls.includes("setEditorText:"));
    assert.ok(calls.includes("promptFollowUp:queued msg"));
    assert.ok(!calls.some((c) => c.startsWith("showPending:")));
    resolvePrompt();
    await Promise.resolve();
    await Promise.resolve();
    assert.ok(calls.some((c) => c.startsWith("showPending:")));
  });

  it("idle path submits trimmed text and clears editor", () => {
    const { deps, calls } = makeFake({ text: "  go  ", streaming: false });
    new FollowUpController(deps).followUp();
    assert.deepEqual(calls, ["setEditorText:", "submit:go"]);
  });

  it("empty editor is a no-op", () => {
    const { deps, calls } = makeFake({ text: "   " });
    new FollowUpController(deps).followUp();
    assert.deepEqual(calls, []);
  });

  it("dequeue combines cleared queue into editor and refreshes pending", () => {
    const { deps, calls, state } = makeFake({
      text: "current",
      queue: { steering: ["s1"], followUp: ["f1"] },
    });
    new FollowUpController(deps).dequeue();
    assert.equal(state.text, "s1\n\nf1\n\ncurrent");
    assert.ok(calls.includes("clearQueue"));
    assert.ok(calls.some((c) => c.startsWith("showPending:")));
  });

  it("dequeue is a no-op when clearQueue returns undefined", () => {
    const { deps, calls } = makeFake({ clearResult: undefined });
    new FollowUpController(deps).dequeue();
    assert.deepEqual(calls, ["clearQueue"]);
  });
});
