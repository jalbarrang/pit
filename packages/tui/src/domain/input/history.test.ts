import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { KillRing, UndoStack } from "./index.ts";

describe("KillRing", () => {
  it("accumulates consecutive kills and rotates yank-pop order", () => {
    const ring = new KillRing();
    ring.push("world", { prepend: false });
    ring.push("hello ", { prepend: true, accumulate: true });
    ring.push("again", { prepend: false });
    assert.equal(ring.peek(), "again");
    ring.rotate();
    assert.equal(ring.peek(), "hello world");
    assert.equal(ring.length, 2);
  });
});

describe("UndoStack", () => {
  it("stores cloned state snapshots", () => {
    const stack = new UndoStack<{ items: string[] }>();
    const state = { items: ["a"] };
    stack.push(state);
    state.items.push("b");
    assert.deepEqual(stack.pop(), { items: ["a"] });
    assert.equal(stack.length, 0);
  });
});
