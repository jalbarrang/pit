import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { combineDequeued, formatPending } from "./message-queue.ts";

describe("combineDequeued", () => {
  it("joins steering, followUp, then current with blank lines", () => {
    assert.equal(
      combineDequeued({ steering: ["s1", "s2"], followUp: ["f1"] }, "now"),
      "s1\n\ns2\n\nf1\n\nnow",
    );
  });

  it("drops trimmed-empty parts", () => {
    assert.equal(
      combineDequeued({ steering: ["", "  "], followUp: ["keep"] }, "  "),
      "keep",
    );
  });

  it("returns empty string when everything is empty", () => {
    assert.equal(combineDequeued({ steering: [], followUp: [] }, ""), "");
    assert.equal(combineDequeued({ steering: ["  "], followUp: [""] }, "   "), "");
  });
});

describe("formatPending", () => {
  it("prefixes steering then follow-up entries and appends the dequeue hint", () => {
    assert.deepEqual(
      formatPending({ steering: ["steer"], followUp: ["follow"] }),
      ["Steering: steer", "Follow-up: follow", "↳ alt+up to edit all queued messages"],
    );
  });

  it("uses the resolved dequeue key in the hint", () => {
    assert.equal(formatPending({ steering: ["s"], followUp: [] }, "alt+j").at(-1), "↳ alt+j to edit all queued messages");
  });

  it("truncates text longer than 60 chars with … suffix", () => {
    const long = "x".repeat(61);
    assert.deepEqual(formatPending({ steering: [long], followUp: [] }), [
      `Steering: ${"x".repeat(60)}…`,
      "↳ alt+up to edit all queued messages",
    ]);
  });

  it("returns empty array when both queues are empty", () => {
    assert.deepEqual(formatPending({ steering: [], followUp: [] }), []);
  });
});
