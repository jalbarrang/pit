import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { thinkingFromContent } from "./chat-parts.ts";

describe("thinkingFromContent", () => {
  it("joins thinking parts and returns empty when none", () => {
    assert.equal(thinkingFromContent("plain"), "");
    assert.equal(thinkingFromContent([{ type: "text", text: "hi" }]), "");
    assert.equal(
      thinkingFromContent([
        { type: "thinking", thinking: "a" },
        { type: "text", text: "x" },
        { type: "thinking", thinking: "b" },
      ]),
      "ab",
    );
  });
});
