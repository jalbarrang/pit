import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseArgs } from "./args.ts";

describe("parseArgs", () => {
  it("parses cwd and resume flags", () => {
    assert.deepEqual(parseArgs(["--cwd", "/tmp/demo", "--resume"], "/repo"), { cwd: "/tmp/demo", resume: true, version: false });
    assert.deepEqual(parseArgs([], "/repo"), { cwd: "/repo", resume: false, version: false });
  });

  it("parses the version flag", () => {
    assert.equal(parseArgs(["--version"], "/repo").version, true);
  });
});
