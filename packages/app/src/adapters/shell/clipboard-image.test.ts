import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  readClipboardImage,
  type ClipboardImageDeps,
} from "./clipboard-image.ts";

type Call = { name: string; args?: unknown[] };

function fakeDeps(overrides: Partial<ClipboardImageDeps> & { calls: Call[] }): ClipboardImageDeps {
  const { calls, ...rest } = overrides;
  return {
    platform: "darwin",
    tmpPath: "/tmp/pit-clip-test.png",
    run: (cmd, args) => {
      calls.push({ name: "run", args: [cmd, args] });
      return { status: 0 };
    },
    readFileBase64: (path) => {
      calls.push({ name: "readFileBase64", args: [path] });
      return "BASE64";
    },
    removeFile: (path) => {
      calls.push({ name: "removeFile", args: [path] });
    },
    ...rest,
  };
}

describe("readClipboardImage", () => {
  it("returns null and skips run on non-darwin", () => {
    const calls: Call[] = [];
    const result = readClipboardImage(fakeDeps({ calls, platform: "linux" }));
    assert.equal(result, null);
    assert.equal(calls.some((c) => c.name === "run"), false);
  });

  it("returns ImagePart on darwin when run succeeds and file has data", () => {
    const calls: Call[] = [];
    const result = readClipboardImage(fakeDeps({ calls }));
    assert.deepEqual(result, {
      data: "BASE64",
      mimeType: "image/png",
      filename: "clipboard.png",
    });
    assert.equal(calls.some((c) => c.name === "removeFile"), true);
  });

  it("returns null and cleans up when run status is non-zero", () => {
    const calls: Call[] = [];
    const result = readClipboardImage(
      fakeDeps({
        calls,
        run: (cmd, args) => {
          calls.push({ name: "run", args: [cmd, args] });
          return { status: 1 };
        },
      }),
    );
    assert.equal(result, null);
    assert.equal(calls.some((c) => c.name === "removeFile"), true);
    assert.equal(calls.some((c) => c.name === "readFileBase64"), false);
  });

  it("returns null when run succeeds but file is missing or empty", () => {
    for (const empty of [null, ""]) {
      const calls: Call[] = [];
      const result = readClipboardImage(
        fakeDeps({
          calls,
          readFileBase64: (path) => {
            calls.push({ name: "readFileBase64", args: [path] });
            return empty;
          },
        }),
      );
      assert.equal(result, null);
      assert.equal(calls.some((c) => c.name === "removeFile"), true);
    }
  });
});
