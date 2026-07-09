import assert from "node:assert/strict";
import { test } from "node:test";
import { CommandRegistry } from "./registry.ts";

const makeRegistry = () => {
  const calls: { name: string; args: string }[] = [];
  const registry = new CommandRegistry<void>();
  registry.register({ name: "quit", description: "Quit pit", handler: (_ctx, args) => void calls.push({ name: "quit", args }) });
  registry.register({ name: "model", description: "Select model", handler: (_ctx, args) => void calls.push({ name: "model", args }) });
  return { registry, calls };
};

test("dispatches a registered command", async () => {
  const { registry, calls } = makeRegistry();
  const result = await registry.dispatch("/quit", undefined);
  assert.deepEqual(result, { kind: "handled", name: "quit" });
  assert.deepEqual(calls, [{ name: "quit", args: "" }]);
});

test("passes trailing text as args", async () => {
  const { registry, calls } = makeRegistry();
  await registry.dispatch("/model gpt-5.5 high", undefined);
  assert.deepEqual(calls, [{ name: "model", args: "gpt-5.5 high" }]);
});

test("unknown command reports its name without invoking handlers", async () => {
  const { registry, calls } = makeRegistry();
  const result = await registry.dispatch("/nonexistent", undefined);
  assert.deepEqual(result, { kind: "unknown", name: "nonexistent" });
  assert.equal(calls.length, 0);
});

test("plain text and bare slash are not commands", async () => {
  const { registry } = makeRegistry();
  assert.deepEqual(await registry.dispatch("hello world", undefined), { kind: "not-command" });
  assert.deepEqual(await registry.dispatch("/", undefined), { kind: "not-command" });
  assert.deepEqual(await registry.dispatch("/not a path/like this", undefined), { kind: "unknown", name: "not" });
});

test("lists commands with descriptions for autocomplete", () => {
  const { registry } = makeRegistry();
  assert.deepEqual(registry.list(), [
    { name: "quit", description: "Quit pit" },
    { name: "model", description: "Select model" },
  ]);
});

test("async handlers are awaited and errors propagate", async () => {
  const registry = new CommandRegistry<void>();
  let done = false;
  registry.register({ name: "slow", description: "", handler: async () => { await Promise.resolve(); done = true; } });
  registry.register({ name: "boom", description: "", handler: () => { throw new Error("boom"); } });
  await registry.dispatch("/slow", undefined);
  assert.equal(done, true);
  await assert.rejects(registry.dispatch("/boom", undefined), /boom/);
});
