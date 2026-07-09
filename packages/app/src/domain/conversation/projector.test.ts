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

  it("tracks tool execution status and output", () => {
    const projector = new TranscriptProjector();
    projector.project({ type: "tool_execution_start", toolCallId: "1", toolName: "read", args: { file: "package.json" } });
    projector.project({ type: "tool_execution_update", toolCallId: "1", partialResult: { content: [{ type: "text", text: "partial" }] } });
    projector.project({ type: "tool_execution_end", toolCallId: "1", result: { content: [{ type: "text", text: "done" }] }, isError: false });
    assert.deepEqual(projector.transcript.snapshot().tools[0], { id: "1", name: "read", args: { file: "package.json" }, status: "succeeded", output: "done", images: [] });
  });

  it("tracks image parts in tool results", () => {
    const projector = new TranscriptProjector();
    projector.project({ type: "tool_execution_start", toolCallId: "1", toolName: "read", args: {} });
    projector.project({ type: "tool_execution_end", toolCallId: "1", result: { content: [{ type: "image", data: "abc", mimeType: "image/png" }] }, isError: false });
    assert.deepEqual(projector.transcript.snapshot().tools[0]?.images, [{ data: "abc", mimeType: "image/png", filename: undefined }]);
  });
});
