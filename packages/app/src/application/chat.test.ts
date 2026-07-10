import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChatController } from "./chat.ts";

class FakeThinking {
  thinking = "";
  appendThinking(delta: string) { this.thinking += delta; }
  setThinking(text: string) { this.thinking = text; }
  setExpanded(_e: boolean) {}
}

class FakeAssistant {
  text = "";
  append(delta: string) { this.text += delta; }
  setText(text: string) { this.text = text; }
  finalize() {}
}

const ui = { Thinking: FakeThinking as never, Assistant: FakeAssistant as never };

const fakeShell = () => {
  const messages: unknown[] = [];
  const thinkingRegistered: unknown[] = [];
  const pendingLines: string[][] = [];
  return {
    messages, thinkingRegistered, pendingLines, tui: { ctx: {} },
    chat: {
      addMessage: (m: unknown) => void messages.push(m),
      removeMessage: (m: unknown) => { const i = messages.indexOf(m); if (i >= 0) messages.splice(i, 1); },
    },
    extensionMount: { createStatusIndicator: () => undefined, clearStatusIndicator: () => {} },
    registerThinking: (c: unknown) => void thinkingRegistered.push(c),
    registerExpandable: () => {}, rememberImages: () => {}, refreshFooter: () => {},
    showPendingFromQueue: (q: { steering: string[]; followUp: string[] }) => {
      pendingLines.push([
        ...q.steering.map((t) => `Steering: ${t}`),
        ...q.followUp.map((t) => `Follow-up: ${t}`),
      ]);
    },
  };
};

const start = (shell: ReturnType<typeof fakeShell>) => {
  let send!: (e: unknown) => void;
  const controller = new ChatController(shell as never, { subscribe: (h: (e: unknown) => void) => { send = h; return () => {}; } } as never, ui);
  controller.start();
  return send;
};

describe("ChatController queue_update", () => {
  it("shows pending widget lines from queue_update items", () => {
    const shell = fakeShell();
    start(shell)({ type: "queue_update", steering: ["steer"], followUp: ["follow"] });
    assert.deepEqual(shell.pendingLines.at(-1), ["Steering: steer", "Follow-up: follow"]);
  });

  it("clears pending widget when queue_update has empty arrays", () => {
    const shell = fakeShell();
    const send = start(shell);
    send({ type: "queue_update", steering: ["steer"], followUp: [] });
    send({ type: "queue_update", steering: [], followUp: [] });
    assert.deepEqual(shell.pendingLines.at(-1), []);
  });
});

describe("ChatController thinking", () => {
  it("adds thinking before assistant on message_start and registers it", () => {
    const shell = fakeShell();
    start(shell)({ type: "message_start", message: { role: "assistant" } });
    assert.equal(shell.messages.length, 2);
    assert.ok(shell.messages[0] instanceof FakeThinking);
    assert.ok(shell.messages[1] instanceof FakeAssistant);
    assert.equal(shell.thinkingRegistered[0], shell.messages[0]);
  });

  it("appends thinking_delta without touching assistant text", () => {
    const shell = fakeShell();
    const send = start(shell);
    send({ type: "message_start", message: { role: "assistant" } });
    send({ type: "message_update", assistantMessageEvent: { type: "thinking_delta", delta: "why" } });
    assert.equal((shell.messages[0] as FakeThinking).thinking, "why");
    assert.equal((shell.messages[1] as FakeAssistant).text, "");
  });

  it("finishAssistant sets final thinking from content", () => {
    const shell = fakeShell();
    const send = start(shell);
    send({ type: "message_start", message: { role: "assistant" } });
    send({
      type: "message_end",
      message: { role: "assistant", content: [{ type: "thinking", thinking: "plan" }, { type: "text", text: "done" }] },
    });
    assert.equal((shell.messages[0] as FakeThinking).thinking, "plan");
    assert.equal((shell.messages[1] as FakeAssistant).text, "done");
  });
});
