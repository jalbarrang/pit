import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

const facade = (session: AgentSession) =>
  new SessionFacade(session, {} as ModelRegistry, {} as LoadExtensionsResult);

describe("SessionFacade compaction", () => {
  it("passes instructions through verbatim and maps CompactionResult", async () => {
    let received: unknown;
    const session = {
      compact(instructions?: string) {
        received = instructions;
        return Promise.resolve({
          summary: "sum",
          firstKeptEntryId: "e1",
          tokensBefore: 1000,
          estimatedTokensAfter: 400,
        });
      },
    } as unknown as AgentSession;
    assert.deepEqual(await facade(session).compact("keep decisions"), {
      summary: "sum",
      tokensBefore: 1000,
      tokensAfter: 400,
    });
    assert.equal(received, "keep decisions");
  });

  it("passes undefined instructions when omitted", async () => {
    let received: unknown = "unset";
    const session = {
      compact(instructions?: string) {
        received = instructions;
        return Promise.resolve({
          summary: "s",
          firstKeptEntryId: "e",
          tokensBefore: 10,
          estimatedTokensAfter: 5,
        });
      },
    } as unknown as AgentSession;
    await facade(session).compact();
    assert.equal(received, undefined);
  });

  it("omits tokensAfter when estimatedTokensAfter is absent", async () => {
    const session = {
      compact() {
        return Promise.resolve({
          summary: "s",
          firstKeptEntryId: "e",
          tokensBefore: 50,
        });
      },
    } as unknown as AgentSession;
    assert.deepEqual(await facade(session).compact(), {
      summary: "s",
      tokensBefore: 50,
      tokensAfter: undefined,
    });
  });

  it("abortCompaction and isCompacting delegate to the session", () => {
    let aborted = 0;
    const session = {
      abortCompaction() { aborted += 1; },
      get isCompacting() { return aborted === 0; },
    } as unknown as AgentSession;
    const f = facade(session);
    assert.equal(f.isCompacting(), true);
    f.abortCompaction();
    assert.equal(aborted, 1);
    assert.equal(f.isCompacting(), false);
  });
});
