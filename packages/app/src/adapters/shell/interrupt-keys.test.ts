import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { promptOptionsForStreaming, shouldAbortStream } from "./interrupt-keys.ts";

describe("stream interrupt keys", () => {
  it("maps escape to abort when a session exists", () => {
    assert.equal(shouldAbortStream("\u001b", true), true);
    assert.equal(shouldAbortStream("\u001b", false), false);
    assert.equal(shouldAbortStream("x", true), false);
  });

  it("steers submitted prompts while streaming", () => {
    assert.deepEqual(promptOptionsForStreaming(true), { streamingBehavior: "steer" });
    assert.equal(promptOptionsForStreaming(false), undefined);
  });
});
