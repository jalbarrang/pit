import assert from "node:assert/strict";
import { test } from "node:test";
import { windowRows } from "./overlay-window.ts";

test("small list fits entirely with no above/below", () => {
  assert.deepEqual(windowRows(5, 2, 10), { start: 0, end: 5, above: 0, below: 0 });
});

test("highlight near top of a long list clamps the window to the start", () => {
  assert.deepEqual(windowRows(30, 0, 10), { start: 0, end: 10, above: 0, below: 20 });
  assert.deepEqual(windowRows(30, 2, 10), { start: 0, end: 10, above: 0, below: 20 });
});

test("highlight in the middle centers the window", () => {
  assert.deepEqual(windowRows(30, 15, 10), { start: 10, end: 20, above: 10, below: 10 });
});

test("highlight near bottom clamps the window to the end", () => {
  assert.deepEqual(windowRows(30, 29, 10), { start: 20, end: 30, above: 20, below: 0 });
  assert.deepEqual(windowRows(30, 27, 10), { start: 20, end: 30, above: 20, below: 0 });
});

test("maxVisible below 1 clamps to 1", () => {
  assert.deepEqual(windowRows(5, 3, 0), { start: 3, end: 4, above: 3, below: 1 });
  assert.deepEqual(windowRows(5, 3, -2), { start: 3, end: 4, above: 3, below: 1 });
});
