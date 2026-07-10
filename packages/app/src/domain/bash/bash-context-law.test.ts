import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { classifies } from "./parse.ts";

const oracle = (i: { bangs: number; excluded: number }): boolean =>
  (i.bangs !== 2 || i.excluded === 1) && (i.bangs !== 1 || i.excluded === 0);

describe("bash-context law classifies", () => {
  for (const bangs of [1, 2]) {
    for (const excluded of [0, 1]) {
      it(`classifies({bangs:${bangs}, excluded:${excluded}}) matches oracle`, () => {
        const i = { bangs, excluded };
        assert.equal(classifies(i), oracle(i));
      });
    }
  }
});
