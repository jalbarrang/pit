import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

const facade = (session: AgentSession) =>
  new SessionFacade(session, {} as ModelRegistry, {} as LoadExtensionsResult);

describe("SessionFacade session info", () => {
  it("contextUsage maps percent and contextWindow to percent/window", () => {
    const session = {
      getContextUsage: () => ({ tokens: 1000, contextWindow: 200_000, percent: 12.5 }),
    } as unknown as AgentSession;
    assert.deepEqual(facade(session).contextUsage(), { percent: 12.5, window: 200_000 });
  });

  it("contextUsage returns undefined when SDK has no usage yet", () => {
    const session = { getContextUsage: () => undefined } as unknown as AgentSession;
    assert.equal(facade(session).contextUsage(), undefined);
  });

  it("contextUsage returns undefined when percent is null", () => {
    const session = {
      getContextUsage: () => ({ tokens: null, contextWindow: 200_000, percent: null }),
    } as unknown as AgentSession;
    assert.equal(facade(session).contextUsage(), undefined);
  });

  it("sessionName returns the SDK sessionName", () => {
    const session = { sessionName: "my-session" } as unknown as AgentSession;
    assert.equal(facade(session).sessionName(), "my-session");
  });

  it("sessionName returns undefined when unnamed", () => {
    const session = { sessionName: undefined } as unknown as AgentSession;
    assert.equal(facade(session).sessionName(), undefined);
  });

  it("setSessionName delegates to the SDK", () => {
    let received: string | undefined;
    const session = {
      setSessionName: (name: string) => { received = name; },
    } as unknown as AgentSession;
    facade(session).setSessionName("renamed");
    assert.equal(received, "renamed");
  });

  it("sessionStats maps SDK SessionStats to the pit shape", () => {
    const session = {
      getSessionStats: () => ({
        sessionFile: "/tmp/s.jsonl",
        sessionId: "abc",
        userMessages: 2,
        assistantMessages: 3,
        toolCalls: 4,
        toolResults: 4,
        totalMessages: 9,
        tokens: { input: 10, output: 20, cacheRead: 0, cacheWrite: 0, total: 30 },
        cost: 0.01,
      }),
    } as unknown as AgentSession;
    assert.deepEqual(facade(session).sessionStats(), {
      file: "/tmp/s.jsonl",
      id: "abc",
      userMessages: 2,
      assistantMessages: 3,
      toolCalls: 4,
      totalMessages: 9,
      totalTokens: 30,
      cost: 0.01,
    });
  });

  it("lastAssistantText returns the SDK text", () => {
    const session = { getLastAssistantText: () => "hello" } as unknown as AgentSession;
    assert.equal(facade(session).lastAssistantText(), "hello");
  });

  it("lastAssistantText returns undefined when no assistant message", () => {
    const session = { getLastAssistantText: () => undefined } as unknown as AgentSession;
    assert.equal(facade(session).lastAssistantText(), undefined);
  });
});
