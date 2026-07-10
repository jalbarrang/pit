import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { gates } from "./gate.ts";

const oracle = (s: { compacting: number; queued: number; sent: number }): boolean =>
  (s.compacting !== 1 || s.queued === 1) &&
  (s.compacting !== 1 || s.sent === 0) &&
  (s.compacting !== 0 || s.sent === 1) &&
  (s.compacting !== 0 || s.queued === 0);

describe("compaction-gate law gates", () => {
  for (const compacting of [0, 1]) {
    for (const queued of [0, 1]) {
      for (const sent of [0, 1]) {
        it(`gates({compacting:${compacting}, queued:${queued}, sent:${sent}}) matches oracle`, () => {
          const s = { compacting, queued, sent };
          assert.equal(gates(s), oracle(s));
        });
      }
    }
  }
});
