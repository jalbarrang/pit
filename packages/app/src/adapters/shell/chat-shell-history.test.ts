import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ChatShell } from "./chat-shell.ts";

describe("ChatShell prompt history feed", () => {
  it("records addToHistory on submit for prompts and commands", async () => {
    const history: string[] = [];
    const shell = Object.create(ChatShell.prototype) as any;
    shell.editor = { addToHistory: (t: string) => history.push(t) };
    shell.chrome = { handle: async (t: string) => t.startsWith("/") };
    shell.session = { prompt: async () => {}, isStreaming: false };
    shell.pendingImages = { takeAll: () => [] };
    await shell["submit"]("hello");
    await shell["submit"]("/help");
    assert.deepEqual(history, ["hello", "/help"]);
  });
});
