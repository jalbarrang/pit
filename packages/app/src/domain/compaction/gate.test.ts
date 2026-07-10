import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decideSubmission } from "./gate.ts";

describe("decideSubmission", () => {
  it("queues when compacting", () => {
    assert.deepEqual(decideSubmission(true), { queued: true, sent: false });
  });

  it("sends when idle", () => {
    assert.deepEqual(decideSubmission(false), { queued: false, sent: true });
  });
});
