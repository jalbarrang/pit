import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseArgs } from "./args.ts";
import { runUpgrade } from "./cli/upgrade.ts";

describe("parseArgs", () => {
  it("parses cwd and resume flags", () => {
    assert.deepEqual(parseArgs(["--cwd", "/tmp/demo", "--resume"], "/repo"), { cwd: "/tmp/demo", resume: true, version: false });
    assert.deepEqual(parseArgs([], "/repo"), { cwd: "/repo", resume: false, version: false });
  });

  it("parses the version flag", () => {
    assert.equal(parseArgs(["--version"], "/repo").version, true);
  });

  it("parses upgrade channel and target version", () => {
    assert.deepEqual(parseArgs(["upgrade", "--channel", "nightly", "--version", "1.2.0-nightly.20260711.4"], "/repo").upgrade,
      { channel: "nightly", version: "1.2.0-nightly.20260711.4" });
    assert.deepEqual(parseArgs(["upgrade"], "/repo").upgrade, {});
  });

  it("rejects invalid upgrade arguments", () => {
    assert.throws(() => parseArgs(["upgrade", "--channel", "dev"]), /stable\|nightly/);
    assert.throws(() => parseArgs(["upgrade", "--version"]), /usage: pit upgrade/);
    assert.throws(() => parseArgs(["upgrade", "--wat"]), /usage: pit upgrade/);
  });
});

describe("runUpgrade", () => {
  it("refuses source mode without checking the network", async () => {
    const errors: string[] = [];
    const result = await runUpgrade({}, { currentChannel: "dev", writeError: (message) => errors.push(message),
      fetchReleases: async () => { throw new Error("must not fetch"); } });
    assert.equal(result, 1);
    assert.deepEqual(errors, ["pit is running from source; use git pull"]);
  });

  it("forces release resolution and installs the newest release", async () => {
    const output: string[] = [];
    let installed = "";
    const result = await runUpgrade({}, { currentChannel: "stable", currentVersion: "1.0.0", write: (message) => output.push(message),
      fetchReleases: async (options) => { assert.equal(options.force, true); return [{ tag: "v1.1.0", prerelease: false }]; },
      install: async (tag) => { installed = tag; } });
    assert.equal(result, 0);
    assert.equal(installed, "v1.1.0");
    assert.deepEqual(output, ["pit v1.0.0 → v1.1.0"]);
  });

  it("treats an explicit --version as a pin that allows downgrades", async () => {
    let installed = "";
    const result = await runUpgrade({ version: "0.9.0" }, { currentChannel: "stable", currentVersion: "1.0.0",
      fetchReleases: async () => { throw new Error("pins must not fetch"); },
      install: async (tag) => { installed = tag; }, write: () => {} });
    assert.equal(result, 0);
    assert.equal(installed, "v0.9.0");
  });

  it("short-circuits a pin equal to the running version", async () => {
    const output: string[] = [];
    const result = await runUpgrade({ version: "1.0.0" }, { currentChannel: "stable", currentVersion: "1.0.0",
      install: async () => { throw new Error("must not install"); }, write: (message) => output.push(message) });
    assert.equal(result, 0);
    assert.deepEqual(output, ["pit v1.0.0 is already up to date"]);
  });
});
