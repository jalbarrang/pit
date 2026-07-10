import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

const facade = (session: AgentSession) =>
  new SessionFacade(session, {} as ModelRegistry, {} as LoadExtensionsResult);

const fakeManager = () => {
  const calls: { navigate?: string; label?: [string, string]; fork?: [string, string] } = {};
  const treeNodes = [{
    entry: {
      type: "message", id: "u1", parentId: null, timestamp: "2024-01-01T00:00:00.000Z",
      message: { role: "user", content: "hi" },
    },
    children: [],
    label: "L",
  }];
  const manager = {
    getTree: () => treeNodes,
    getLeafId: () => "u1",
    getSessionFile: () => "/src/session.jsonl",
    getCwd: () => "/cwd",
    appendLabelChange: (id: string, label: string) => { calls.label = [id, label]; return "lbl"; },
  };
  return { manager, calls, treeNodes };
};

describe("SessionFacade tree gateway", () => {
  it("tree/leafId/branchTo/setLabel: navigateTree + label; returns editorText", async () => {
    const { manager, calls } = fakeManager();
    const session = {
      sessionManager: manager,
      navigateTree: async (id: string) => { calls.navigate = id; return { editorText: "restore me", cancelled: false }; },
    } as unknown as AgentSession;
    const f = facade(session);
    assert.equal(f.tree()[0].kind, "user");
    assert.equal(f.tree()[0].label, "L");
    assert.equal(f.leafId(), "u1");
    assert.equal(await f.branchTo("u1"), "restore me");
    f.setLabel("u1", "bookmark");
    assert.equal(calls.navigate, "u1");
    assert.deepEqual(calls.label, ["u1", "bookmark"]);
  });

  it("leafId maps null to undefined", () => {
    const session = {
      sessionManager: { getLeafId: () => null },
    } as unknown as AgentSession;
    assert.equal(facade(session).leafId(), undefined);
  });

  it("forkSession calls SessionManager.forkFrom and returns new path", () => {
    const { manager, calls } = fakeManager();
    const session = { sessionManager: manager } as unknown as AgentSession;
    const original = SessionManager.forkFrom;
    SessionManager.forkFrom = ((source: string, cwd: string) => {
      calls.fork = [source, cwd];
      return { getSessionFile: () => "/new/session.jsonl" } as SessionManager;
    }) as typeof SessionManager.forkFrom;
    try {
      assert.equal(facade(session).forkSession(), "/new/session.jsonl");
      assert.deepEqual(calls.fork, ["/src/session.jsonl", "/cwd"]);
    } finally {
      SessionManager.forkFrom = original;
    }
  });
});
