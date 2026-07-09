import assert from "node:assert/strict";
import { test } from "node:test";
import { createBuiltinRegistry, type ChromeContext } from "./builtins.ts";

const makeContext = () => {
  const log: string[] = [];
  const context: ChromeContext = {
    notify: (text) => void log.push(`notify:${text}`),
    exit: () => void log.push("exit"),
    openModelSelector: (search) => void log.push(`model:${search}`),
    openThinkingSelector: () => void log.push("thinking"),
  };
  return { context, log };
};

test("/model opens the model selector passing the search term", async () => {
  const { context, log } = makeContext();
  await createBuiltinRegistry().dispatch("/model gpt", context);
  await createBuiltinRegistry().dispatch("/model", context);
  assert.deepEqual(log, ["model:gpt", "model:"]);
});

test("/thinking opens the thinking selector", async () => {
  const { context, log } = makeContext();
  await createBuiltinRegistry().dispatch("/thinking", context);
  assert.deepEqual(log, ["thinking"]);
});

test("/quit exits via the context port", async () => {
  const { context, log } = makeContext();
  const result = await createBuiltinRegistry().dispatch("/quit", context);
  assert.deepEqual(result, { kind: "handled", name: "quit" });
  assert.deepEqual(log, ["exit"]);
});

test("every builtin has a description for autocomplete", () => {
  for (const command of createBuiltinRegistry().list()) {
    assert.ok(command.description.length > 0, `${command.name} missing description`);
  }
});
