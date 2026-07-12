import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { channel, version } from "./release-info.ts";

describe("release info", () => {
  it("falls back to development values without compile-time defines", () => {
    assert.equal(version, "0.0.0-dev");
    assert.equal(channel, "dev");
  });
});
