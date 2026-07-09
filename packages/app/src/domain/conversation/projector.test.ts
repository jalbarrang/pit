import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { TranscriptProjector } from "./projector.ts";

const fixture = new URL("../../../test-fixtures/session-smoke-events.jsonl", import.meta.url);
const readEvents = (): Record<string, unknown>[] =>
  readFileSync(fixture, "utf8").trim().split("\n").map((line) => JSON.parse(line) as Record<string, unknown>);

describe("TranscriptProjector", () => {
  it("projects a real session fixture into user and assistant turns", () => {
    const projector = new TranscriptProjector();
    for (const event of readEvents()) projector.project(event);
    const snapshot = projector.transcript.snapshot();
    assert.equal(snapshot.turns[0]?.role, "user");
    assert.equal(snapshot.turns[0]?.text, "say hi");
    assert.equal(snapshot.turns[1]?.role, "assistant");
    assert.match(snapshot.turns[1]?.text ?? "", /Hi/);
    assert.equal(snapshot.turns[1]?.streaming, "complete");
  });
});
