import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

const model = (provider: string, id: string) => ({ provider, id });
const facade = (session: AgentSession, models: Array<{ provider: string; id: string }> = []) =>
  new SessionFacade(session, { getAvailable: () => models } as unknown as ModelRegistry, {} as never);

describe("SessionFacade scoped models", () => {
  it("scopedModels maps SDK entries to ModelRef", () => {
    const session = {
      scopedModels: [
        { model: model("openai", "gpt-5.5") },
        { model: model("anthropic", "claude-opus-4-8"), thinkingLevel: "high" },
      ],
    } as unknown as AgentSession;
    assert.deepEqual(facade(session).scopedModels(), [
      { provider: "openai", id: "gpt-5.5" },
      { provider: "anthropic", id: "claude-opus-4-8" },
    ]);
  });

  it("setScopedModels(null) clears scope via empty SDK array", () => {
    let received: unknown;
    const session = { setScopedModels: (entries: unknown) => { received = entries; } } as unknown as AgentSession;
    facade(session).setScopedModels(null);
    assert.deepEqual(received, []);
  });

  it("setScopedModels resolves refs against available models and skips unknowns", () => {
    const available = [model("openai", "gpt-5.5"), model("anthropic", "claude-opus-4-8")];
    let received: Array<{ model: { provider: string; id: string } }> | undefined;
    const session = {
      setScopedModels: (entries: Array<{ model: { provider: string; id: string } }>) => { received = entries; },
    } as unknown as AgentSession;
    facade(session, available).setScopedModels([
      { provider: "anthropic", id: "claude-opus-4-8" },
      { provider: "missing", id: "nope" },
      { provider: "openai", id: "gpt-5.5" },
    ]);
    assert.deepEqual(received, [{ model: available[1] }, { model: available[0] }]);
  });
});

describe("SessionFacade.cycleModel", () => {
  it("returns provider/id from SDK result", async () => {
    const session = {
      cycleModel: async () => ({ model: model("openai", "gpt-5.5"), thinkingLevel: "off", isScoped: false }),
    } as unknown as AgentSession;
    assert.equal(await facade(session).cycleModel("forward"), "openai/gpt-5.5");
  });

  it("returns undefined when SDK returns undefined", async () => {
    const session = { cycleModel: async () => undefined } as unknown as AgentSession;
    assert.equal(await facade(session).cycleModel("backward"), undefined);
  });
});
