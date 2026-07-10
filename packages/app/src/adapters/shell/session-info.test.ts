import assert from "node:assert/strict";
import { test } from "node:test";
import { SessionInfoSelectors } from "./session-info.ts";

const make = (session: Record<string, unknown> | undefined, opts: { copyOk?: boolean } = {}) => {
  const log: string[] = [];
  const host = {
    session: () => session as never,
    notify: (text: string) => void log.push(`notify:${text}`),
    refreshFooter: () => void log.push("footer"),
    copyToClipboard: (text: string) => { log.push(`clip:${text}`); return opts.copyOk !== false; },
    noticeCopied: () => void log.push("copied"),
  };
  return { selectors: new SessionInfoSelectors(host), log };
};

test("renameSession with empty args shows current name", () => {
  const { selectors, log } = make({ sessionName: () => "alpha" });
  selectors.renameSession("  ");
  assert.deepEqual(log, ["notify:Session: alpha"]);
});

test("renameSession with empty args shows unnamed when no name", () => {
  const { selectors, log } = make({});
  selectors.renameSession("");
  assert.deepEqual(log, ["notify:Session: (unnamed)"]);
});

test("renameSession sets name, refreshes footer, notifies", () => {
  let named = "";
  const { selectors, log } = make({ setSessionName: (n: string) => { named = n; } });
  selectors.renameSession("  beta  ");
  assert.equal(named, "beta");
  assert.deepEqual(log, ["footer", "notify:Session named: beta"]);
});

test("renameSession notifies when setSessionName absent", () => {
  const { selectors, log } = make({});
  selectors.renameSession("gamma");
  assert.deepEqual(log, ["notify:Naming unavailable"]);
});

test("showSessionStats notifies when unavailable", () => {
  const { selectors, log } = make({});
  selectors.showSessionStats();
  assert.deepEqual(log, ["notify:Session stats unavailable"]);
});

test("showSessionStats formats compact multi-line stats with cost", () => {
  const { selectors, log } = make({
    sessionStats: () => ({
      file: "/tmp/s.jsonl", id: "abc", userMessages: 2, assistantMessages: 3,
      toolCalls: 4, totalMessages: 5, totalTokens: 1000, cost: 0.01234567,
    }),
  });
  selectors.showSessionStats();
  assert.equal(log.length, 1);
  assert.match(log[0]!, /notify:\/tmp\/s\.jsonl\nabc\nmessages: 2 user \/ 3 assistant\ntools: 4\ntokens: 1000\ncost: \$0\.0123$/);
});

test("showSessionStats omits file and cost when absent", () => {
  const { selectors, log } = make({
    sessionStats: () => ({
      id: "xyz", userMessages: 1, assistantMessages: 0, toolCalls: 0, totalMessages: 1, totalTokens: 10,
    }),
  });
  selectors.showSessionStats();
  assert.equal(log[0], "notify:xyz\nmessages: 1 user / 0 assistant\ntools: 0\ntokens: 10");
});

test("copyLastAssistant notifies when nothing to copy", () => {
  const { selectors, log } = make({});
  selectors.copyLastAssistant();
  assert.deepEqual(log, ["notify:Nothing to copy"]);
});

test("copyLastAssistant copies and notices on success", () => {
  const { selectors, log } = make({ lastAssistantText: () => "hello" });
  selectors.copyLastAssistant();
  assert.deepEqual(log, ["clip:hello", "copied"]);
});

test("copyLastAssistant notifies when clipboard unavailable", () => {
  const { selectors, log } = make({ lastAssistantText: () => "hello" }, { copyOk: false });
  selectors.copyLastAssistant();
  assert.deepEqual(log, ["clip:hello", "notify:Clipboard unavailable — terminal has no OSC52"]);
});
