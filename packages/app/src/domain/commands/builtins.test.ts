import assert from "node:assert/strict";
import { test } from "node:test";
import { createBuiltinRegistry, type ChromeContext } from "./builtins.ts";

const makeContext = () => {
  const log: string[] = [];
  const context: ChromeContext = {
    notify: (text) => void log.push(`notify:${text}`),
    exit: () => void log.push("exit"),
  };
  return { context, log };
};

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
