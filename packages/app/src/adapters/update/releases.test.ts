import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { GITHUB_RELEASES_URL, fetchReleases } from "./releases.ts";

const response = (body: unknown, ok = true) => ({ ok, json: async () => body });
const stateFile = () => {
  const dir = mkdtempSync(join(tmpdir(), "pit-releases-test-"));
  return { path: join(dir, "update-check.json"), clean: () => rmSync(dir, { recursive: true, force: true }) };
};

describe("fetchReleases", () => {
  it("maps GitHub releases and skips a fresh 24-hour check", async () => {
    const state = stateFile();
    let calls = 0;
    const fetch = async (url: string) => {
      calls++;
      assert.equal(url, GITHUB_RELEASES_URL);
      return response([{ tag_name: "v1.2.0", prerelease: false }]);
    };
    try {
      assert.deepEqual(await fetchReleases({ fetch, statePath: state.path, now: () => 1_000_000 }), [{ tag: "v1.2.0", prerelease: false }]);
      assert.equal(await fetchReleases({ fetch, statePath: state.path, now: () => 1_000_001 }), null);
      assert.equal(calls, 1);
      await fetchReleases({ fetch, statePath: state.path, now: () => 1_000_001, force: true });
      assert.equal(calls, 2);
    } finally { state.clean(); }
  });

  it("returns null for network, rate-limit, and bad JSON errors", async () => {
    const state = stateFile();
    try {
      assert.equal(await fetchReleases({ fetch: async () => { throw new Error("offline"); }, statePath: state.path, force: true }), null);
      assert.equal(await fetchReleases({ fetch: async () => response({}, false), statePath: state.path, force: true }), null);
      assert.equal(await fetchReleases({ fetch: async () => response({ message: "not an array" }), statePath: state.path, force: true }), null);
    } finally { state.clean(); }
  });
});
