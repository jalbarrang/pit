import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChatController } from "./chat.ts";

class FakeCompactionSummary {
  summary = ""; tokensBefore = 0; tokensAfter?: number;
  setSummary(summary: string, tokensBefore: number, tokensAfter?: number) {
    this.summary = summary; this.tokensBefore = tokensBefore; this.tokensAfter = tokensAfter;
  }
  setExpanded(_e: boolean) {}
}

const ui = { CompactionSummary: FakeCompactionSummary as never };

const fakeShell = () => {
  const messages: unknown[] = [];
  const expandables: unknown[] = [];
  const notifications: string[] = [];
  let workingMessage: string | undefined;
  let workingVisible = false;
  let flushCalls = 0;
  return {
    messages, expandables, notifications,
    get workingMessage() { return workingMessage; },
    get workingVisible() { return workingVisible; },
    get flushCalls() { return flushCalls; },
    tui: { ctx: {} },
    chat: { addMessage: (m: unknown) => void messages.push(m), removeMessage: () => {} },
    extensionMount: { createStatusIndicator: () => undefined, clearStatusIndicator: () => {} },
    registerThinking: () => {}, registerExpandable: (c: unknown) => void expandables.push(c),
    rememberImages: () => {}, refreshFooter: () => {},
    setWorkingMessage: (m?: string) => { workingMessage = m; },
    setWorkingVisible: (v: boolean) => { workingVisible = v; },
    notifyExtension: (t: string) => void notifications.push(t),
    flushCompactionQueue: () => { flushCalls += 1; },
  };
};

const start = (shell: ReturnType<typeof fakeShell>) => {
  let send!: (e: unknown) => void;
  new ChatController(shell as never, { subscribe: (h: (e: unknown) => void) => { send = h; return () => {}; } } as never, ui).start();
  return send;
};

describe("ChatController compaction", () => {
  it("compaction_start sets working message and visible for manual", () => {
    const shell = fakeShell();
    start(shell)({ type: "compaction_start", reason: "manual" });
    assert.equal(shell.workingMessage, "Compacting context…");
    assert.equal(shell.workingVisible, true);
  });

  it("compaction_start uses Auto-compacting for non-manual", () => {
    const shell = fakeShell();
    start(shell)({ type: "compaction_start", reason: "threshold" });
    assert.equal(shell.workingMessage, "Auto-compacting…");
    assert.equal(shell.workingVisible, true);
  });

  it("compaction_end with result hides working, registers, adds summary, flushes", () => {
    const shell = fakeShell();
    const send = start(shell);
    send({ type: "compaction_start", reason: "overflow" });
    send({
      type: "compaction_end", reason: "overflow", aborted: false, willRetry: false,
      result: { summary: "did stuff", tokensBefore: 900, estimatedTokensAfter: 300 },
    });
    assert.equal(shell.workingVisible, false);
    assert.equal(shell.messages.length, 1);
    assert.ok(shell.messages[0] instanceof FakeCompactionSummary);
    assert.equal(shell.expandables[0], shell.messages[0]);
    const summary = shell.messages[0] as FakeCompactionSummary;
    assert.equal(summary.summary, "did stuff");
    assert.equal(summary.tokensBefore, 900);
    assert.equal(summary.tokensAfter, 300);
    assert.equal(shell.flushCalls, 1);
    assert.equal(shell.notifications.length, 0);
  });

  it("compaction_end aborted notifies cancelled and does not add component", () => {
    const shell = fakeShell();
    start(shell)({ type: "compaction_end", reason: "manual", aborted: true, willRetry: false });
    assert.equal(shell.workingVisible, false);
    assert.deepEqual(shell.notifications, ["Compaction cancelled"]);
    assert.equal(shell.messages.length, 0);
    assert.equal(shell.flushCalls, 1);
  });

  it("compaction_end with errorMessage notifies failure", () => {
    const shell = fakeShell();
    start(shell)({ type: "compaction_end", reason: "threshold", aborted: false, willRetry: false, errorMessage: "boom" });
    assert.equal(shell.workingVisible, false);
    assert.deepEqual(shell.notifications, ["Compaction failed: boom"]);
    assert.equal(shell.messages.length, 0);
    assert.equal(shell.flushCalls, 1);
  });
});
