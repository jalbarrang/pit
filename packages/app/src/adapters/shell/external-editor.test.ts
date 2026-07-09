import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { openInExternalEditor, type ExternalEditorDeps } from "./external-editor.ts";

type Call = string;

const fakeDeps = (overrides: Partial<ExternalEditorDeps> = {}): { deps: ExternalEditorDeps; calls: Call[] } => {
  const calls: Call[] = [];
  const deps: ExternalEditorDeps = {
    argv: ["code", "-w"],
    text: "hello",
    tmpPath: "/tmp/pit-test.md",
    writeFile: (path, data) => void calls.push(`writeFile:${path}:${data}`),
    readFile: (path) => { calls.push(`readFile:${path}`); return "edited"; },
    removeFile: (path) => void calls.push(`removeFile:${path}`),
    spawn: (cmd, args) => void calls.push(`spawn:${cmd}:${args.join(",")}`),
    suspend: () => void calls.push("suspend"),
    resume: () => void calls.push("resume"),
    setText: (text) => void calls.push(`setText:${text}`),
    ...overrides,
  };
  return { deps, calls };
};

describe("openInExternalEditor", () => {
  it("writes, suspends, spawns, resumes, reads, sets text, then removes", () => {
    const { deps, calls } = fakeDeps();
    openInExternalEditor(deps);
    assert.deepEqual(calls, [
      "writeFile:/tmp/pit-test.md:hello",
      "suspend",
      "spawn:code:-w,/tmp/pit-test.md",
      "resume",
      "readFile:/tmp/pit-test.md",
      "setText:edited",
      "removeFile:/tmp/pit-test.md",
    ]);
  });

  it("resumes even when spawn throws", () => {
    const { deps, calls } = fakeDeps({
      spawn: () => {
        calls.push("spawn:throw");
        throw new Error("spawn failed");
      },
    });
    assert.throws(() => openInExternalEditor(deps), /spawn failed/);
    assert.ok(calls.includes("suspend"));
    assert.ok(calls.includes("resume"));
    assert.equal(calls.indexOf("suspend"), calls.indexOf("spawn:throw") - 1);
    assert.equal(calls.indexOf("resume"), calls.indexOf("spawn:throw") + 1);
  });
});
