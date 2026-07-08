import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findWordBackward, findWordForward } from "./index.ts";

describe("WordNavigation", () => {
  it("moves across basic words and punctuation boundaries", () => {
    assert.equal(findWordBackward("hello world", 11), 6);
    assert.equal(findWordBackward("foo.bar", 7), 4);
    assert.equal(findWordBackward("foo.bar", 4), 3);
    assert.equal(findWordForward("hello world", 0), 5);
    assert.equal(findWordForward("foo.bar", 3), 4);
  });

  it("walks path segments and punctuation runs", () => {
    assert.equal(findWordBackward("path/to/file", 12), 8);
    assert.equal(findWordBackward("path/to/file", 8), 7);
    assert.equal(findWordForward("path/to/file", 4), 5);
    assert.equal(findWordForward("foo...bar", 3), 6);
  });

  it("treats configured atomic segments as single units", () => {
    const marker = "[paste #1 +5 lines]";
    const text = `hello ${marker} world`;
    const opts = {
      isAtomicSegment: (segment: string) => segment === marker,
      segment: (input: string) => segmentsFor(input, text, marker),
    };
    assert.equal(findWordBackward(text, 26, opts), 6);
    assert.equal(findWordForward(text, 6, opts), 6 + marker.length);
  });
});

const segmentsFor = (input: string, text: string, marker: string): Intl.SegmentData[] => {
  if (input.startsWith(marker)) return [{ segment: marker, index: 0, input: text, isWordLike: true }];
  return [
    { segment: "hello", index: 0, input: text, isWordLike: true },
    { segment: " ", index: 5, input: text, isWordLike: false },
    { segment: marker, index: 6, input: text, isWordLike: true },
    { segment: " ", index: 25, input: text, isWordLike: false },
  ];
};
