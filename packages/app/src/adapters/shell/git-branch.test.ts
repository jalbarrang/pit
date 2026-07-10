import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGitBranch } from "./git-branch.ts";

describe("createGitBranch", () => {
  it("trims successful stdout", () => {
    const branch = createGitBranch({
      run: () => ({ status: 0, stdout: "  main\n" }),
      now: () => 0,
    });
    assert.equal(branch(), "main");
  });

  it("returns empty string on non-zero status", () => {
    const branch = createGitBranch({
      run: () => ({ status: 128, stdout: "fatal" }),
      now: () => 0,
    });
    assert.equal(branch(), "");
  });

  it("returns empty string when run throws", () => {
    const branch = createGitBranch({
      run: () => {
        throw new Error("spawn failed");
      },
      now: () => 0,
    });
    assert.equal(branch(), "");
  });

  it("caches within 5000ms TTL and re-runs after", () => {
    let calls = 0;
    let t = 0;
    const branch = createGitBranch({
      run: () => {
        calls += 1;
        return { status: 0, stdout: `b${calls}` };
      },
      now: () => t,
    });
    assert.equal(branch(), "b1");
    t = 4999;
    assert.equal(branch(), "b1");
    assert.equal(calls, 1);
    t = 5000;
    assert.equal(branch(), "b2");
    assert.equal(calls, 2);
  });
});
