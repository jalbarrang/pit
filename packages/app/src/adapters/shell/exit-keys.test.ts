import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DoubleCtrlCExit } from "./exit-keys.ts";

describe("double ctrl-c exit", () => {
  it("exits only on the second ctrl-c inside the window", () => {
    let now = 100;
    const keys = new DoubleCtrlCExit(() => now, 500);
    assert.equal(keys.input("x"), "ignored");
    assert.equal(keys.input("\u0003"), "armed");
    now = 400;
    assert.equal(keys.input("\u0003"), "exit");
  });

  it("re-arms after the window expires", () => {
    let now = 100;
    const keys = new DoubleCtrlCExit(() => now, 500);
    assert.equal(keys.input("\u0003"), "armed");
    now = 700;
    assert.equal(keys.input("\u0003"), "armed");
  });
});
