import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

const facade = (session: AgentSession) =>
  new SessionFacade(session, {} as ModelRegistry, {} as LoadExtensionsResult);

describe("SessionFacade bash", () => {
  it("streams chunks through onChunk and does not re-emit result.output", async () => {
    const chunks: string[] = [];
    const session = {
      executeBash(command: string, onChunk?: (chunk: string) => void) {
        assert.equal(command, "echo hi");
        onChunk?.("hel");
        onChunk?.("lo");
        return Promise.resolve({
          output: "hello",
          exitCode: 0,
          cancelled: false,
          truncated: false,
        });
      },
    } as unknown as AgentSession;
    const result = await facade(session).executeBash("echo hi", (c) => chunks.push(c), {
      excludeFromContext: false,
    });
    assert.deepEqual(chunks, ["hel", "lo"]);
    assert.deepEqual(result, { exitCode: 0, cancelled: false });
  });

  it("passes excludeFromContext true through verbatim", async () => {
    let received: unknown;
    const session = {
      executeBash(_command: string, _onChunk?: (chunk: string) => void, options?: unknown) {
        received = options;
        return Promise.resolve({ output: "", exitCode: 0, cancelled: false, truncated: false });
      },
    } as unknown as AgentSession;
    await facade(session).executeBash("!!ls", () => {}, { excludeFromContext: true });
    assert.deepEqual(received, { excludeFromContext: true });
  });

  it("passes excludeFromContext false through verbatim", async () => {
    let received: unknown;
    const session = {
      executeBash(_command: string, _onChunk?: (chunk: string) => void, options?: unknown) {
        received = options;
        return Promise.resolve({ output: "", exitCode: 1, cancelled: false, truncated: false });
      },
    } as unknown as AgentSession;
    await facade(session).executeBash("!ls", () => {}, { excludeFromContext: false });
    assert.deepEqual(received, { excludeFromContext: false });
  });

  it("maps cancelled result without exitCode", async () => {
    const session = {
      executeBash() {
        return Promise.resolve({
          output: "partial",
          exitCode: undefined,
          cancelled: true,
          truncated: false,
        });
      },
    } as unknown as AgentSession;
    assert.deepEqual(
      await facade(session).executeBash("sleep 99", () => {}, { excludeFromContext: false }),
      { exitCode: undefined, cancelled: true },
    );
  });

  it("abortBash and isBashRunning delegate to the session", () => {
    let aborted = 0;
    const session = {
      abortBash() { aborted += 1; },
      get isBashRunning() { return aborted === 0; },
    } as unknown as AgentSession;
    const f = facade(session);
    assert.equal(f.isBashRunning(), true);
    f.abortBash();
    assert.equal(aborted, 1);
    assert.equal(f.isBashRunning(), false);
  });
});
