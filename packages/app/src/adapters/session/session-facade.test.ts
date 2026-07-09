import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentSession, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionFacade } from "./session-facade.ts";

type PromptCall = { text: string; options?: unknown };

const fakeSession = () => {
  const calls: PromptCall[] = [];
  const session = {
    prompt(text: string, options?: unknown) {
      calls.push({ text, options });
      return Promise.resolve();
    },
  } as unknown as AgentSession;
  return { session, calls };
};

const facade = (session: AgentSession) =>
  new SessionFacade(session, {} as ModelRegistry, {} as LoadExtensionsResult);

describe("SessionFacade.prompt images", () => {
  it("maps ImagePart[] to ImageContent[] and drops filename", async () => {
    const { session, calls } = fakeSession();
    await facade(session).prompt("hi", {
      images: [{ data: "abc", mimeType: "image/png", filename: "x.png" }],
    });
    assert.deepEqual(calls, [{
      text: "hi",
      options: { images: [{ type: "image", data: "abc", mimeType: "image/png" }] },
    }]);
  });

  it("passes options through unchanged when images absent", async () => {
    const { session, calls } = fakeSession();
    const options = { streamingBehavior: "steer" as const };
    await facade(session).prompt("hi", options);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].text, "hi");
    assert.equal(calls[0].options, options);
  });
});
