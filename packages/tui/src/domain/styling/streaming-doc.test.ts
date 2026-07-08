import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { StreamingDoc } from "./streaming-doc.ts";

describe("StreamingDoc", () => {
  it("reports a cache hit when only the tail block after the last blank line changes", () => {
    const doc = new StreamingDoc();
    const first = doc.apply("# Title\n\npara one");
    assert.equal(first.cacheHit, false);
    assert.equal(first.stablePrefix, "# Title\n\n");
    assert.equal(first.tail, "para one");

    const second = doc.apply("# Title\n\npara one and more");
    assert.equal(second.cacheHit, true);
    assert.equal(second.stablePrefix, "# Title\n\n");
    assert.equal(second.tail, "para one and more");
  });

  it("reports a cache miss when a new block boundary appears", () => {
    const doc = new StreamingDoc();
    doc.apply("# Title\n\npara one");
    const next = doc.apply("# Title\n\npara one\n\npara two");
    assert.equal(next.cacheHit, false);
    assert.equal(next.stablePrefix, "# Title\n\npara one\n\n");
    assert.equal(next.tail, "para two");
  });

  it("treats a document with no blank line as all-tail", () => {
    const doc = new StreamingDoc();
    const slice = doc.apply("growing without break");
    assert.equal(slice.cacheHit, false);
    assert.equal(slice.stablePrefix, "");
    assert.equal(slice.tail, "growing without break");
  });
});
