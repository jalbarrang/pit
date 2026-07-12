import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { atomicSwap, installRelease, platformTriple } from "./install.ts";

const fakeResponse = (data: Buffer) => ({ ok: true, arrayBuffer: async () => data, text: async () => data.toString() });
const fixture = () => {
  const dir = mkdtempSync(join(tmpdir(), "pit-install-test-"));
  return { dir, target: join(dir, "pit"), clean: () => rmSync(dir, { recursive: true, force: true }) };
};

describe("self update installer", () => {
  it("uses the build pipeline platform triples", () => {
    assert.equal(platformTriple("darwin", "arm64"), "aarch64-apple-darwin");
    assert.equal(platformTriple("darwin", "x64"), "x86_64-apple-darwin");
    assert.equal(platformTriple("linux", "x64"), "x86_64-unknown-linux-gnu");
    assert.equal(platformTriple("linux", "arm64"), "aarch64-unknown-linux-gnu");
  });

  it("rejects a tampered archive before extraction", async () => {
    const f = fixture();
    writeFileSync(f.target, "old");
    let extracted = false;
    const checksum = `${createHash("sha256").update("original").digest("hex")}  pit-x86_64-unknown-linux-gnu.tar.gz\n`;
    const fetch = async (url: string) => fakeResponse(Buffer.from(url.endsWith(".sha256") ? checksum : "tampered"));
    try {
      await assert.rejects(installRelease("v1.2.0", "stable", { fetch, execPath: f.target, platform: "linux", arch: "x64", extract: async () => { extracted = true; } }), /checksum mismatch/);
      assert.equal(extracted, false);
      assert.equal(readFileSync(f.target, "utf8"), "old");
    } finally { f.clean(); }
  });

  it("chmods and atomically renames a replacement over the target", async () => {
    const f = fixture();
    const source = join(f.dir, "replacement");
    writeFileSync(f.target, "old");
    writeFileSync(source, "new");
    chmodSync(source, 0o600);
    try {
      await atomicSwap(source, f.target);
      assert.equal(readFileSync(f.target, "utf8"), "new");
      assert.equal(statSync(f.target).mode & 0o777, 0o755);
    } finally { f.clean(); }
  });

  it("refuses to update a source build", async () => {
    await assert.rejects(installRelease("v1.2.0", "dev"), /running from source/);
  });
});
