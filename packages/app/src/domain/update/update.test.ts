import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { availableUpdate, compareVersions, pickLatest } from "./index.ts";

const release = (tag: string, prerelease = false) => ({ tag, prerelease });

describe("update versions", () => {
  it("finds a stable upgrade and ignores prereleases", () => {
    const releases = [release("v1.3.0-nightly.20260710.2", true), release("v1.2.0"), release("v1.1.0")];
    assert.equal(pickLatest("stable", releases), "v1.2.0");
    assert.equal(availableUpdate("1.1.0", "stable", releases), "v1.2.0");
  });

  it("finds the newest nightly by numeric tuple", () => {
    const releases = [release("v1.3.0-nightly.20260710.9", true), release("v1.3.0-nightly.20260710.10", true)];
    assert.equal(availableUpdate("1.3.0-nightly.20260710.8", "nightly", releases), "v1.3.0-nightly.20260710.10");
  });

  it("returns null for equal versions and development builds", () => {
    assert.equal(availableUpdate("1.2.0", "stable", [release("v1.2.0")]), null);
    assert.equal(availableUpdate("0.0.0-dev", "dev", [release("v9.0.0")]), null);
  });

  it("skips malformed and cross-channel tags", () => {
    const releases = [release("latest"), release("v2.0.0-nightly.20260710.1", true), release("v1.4.0")];
    assert.equal(pickLatest("stable", releases), "v1.4.0");
    assert.equal(compareVersions("1.4.0", "1.4.0-nightly.20260710.1", "stable"), null);
    assert.equal(compareVersions("1.4.0-nightly.20260710.1", "1.4.0", "nightly"), null);
  });
});
