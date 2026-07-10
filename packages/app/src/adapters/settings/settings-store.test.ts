import assert from "node:assert/strict";
import { test } from "node:test";
import { SettingsStore } from "./settings-store.ts";

test("getEnabledModels delegates to the injected manager", () => {
  const manager = {
    getEnabledModels: () => ["anthropic/*", "openai/gpt-4o"],
    setEnabledModels: () => {},
    flush: async () => {},
    getTheme: () => "dark",
    getShowImages: () => false,
    getImageAutoResize: () => true,
    getBlockImages: () => false,
    getEditorPaddingX: () => 0,
    getAutocompleteMaxVisible: () => 5,
  };
  const store = new SettingsStore("/tmp", manager as never);
  assert.deepEqual(store.getEnabledModels(), ["anthropic/*", "openai/gpt-4o"]);
});

test("setEnabledModels writes patterns and flushes", async () => {
  const log: string[] = [];
  const manager = {
    getEnabledModels: () => undefined,
    setEnabledModels: (patterns: string[] | undefined) => void log.push(`set:${JSON.stringify(patterns)}`),
    flush: async () => void log.push("flush"),
    getTheme: () => "dark",
    getShowImages: () => false,
    getImageAutoResize: () => true,
    getBlockImages: () => false,
    getEditorPaddingX: () => 0,
    getAutocompleteMaxVisible: () => 5,
  };
  const store = new SettingsStore("/tmp", manager as never);
  await store.setEnabledModels(["anthropic/claude-opus-4-8"]);
  await store.setEnabledModels(undefined);
  assert.deepEqual(log, [
    'set:["anthropic/claude-opus-4-8"]',
    "flush",
    "set:undefined",
    "flush",
  ]);
});
