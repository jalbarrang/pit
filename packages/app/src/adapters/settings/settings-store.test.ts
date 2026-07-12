import assert from "node:assert/strict";
import { test } from "node:test";
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { defaultPitSettings } from "../../domain/chrome/index.ts";
import { SettingsStore } from "./settings-store.ts";

const makeStore = () => new SettingsStore("/tmp", SettingsManager.inMemory());

test("get returns pi defaults when nothing is set", () => {
  assert.deepEqual(makeStore().get(), defaultPitSettings());
});

test("set persists every parity key and reads it back", async () => {
  const store = makeStore();
  const cases: Array<[string, string, keyof ReturnType<SettingsStore["get"]>, unknown]> = [
    ["theme", "light", "theme", "light"],
    ["autoCompact", "false", "autoCompact", false],
    ["steeringMode", "all", "steeringMode", "all"],
    ["followUpMode", "all", "followUpMode", "all"],
    ["transport", "websocket", "transport", "websocket"],
    ["httpIdleTimeout", "1 min", "httpIdleTimeoutMs", 60_000],
    ["hideThinkingBlock", "true", "hideThinkingBlock", true],
    ["defaultProjectTrust", "always", "defaultProjectTrust", "always"],
    ["treeFilterMode", "no-tools", "treeFilterMode", "no-tools"],
    ["showImages", "true", "showImages", true],
    ["imageWidthCells", "120", "imageWidthCells", 120],
    ["autoResizeImages", "false", "autoResizeImages", false],
    ["blockImages", "true", "blockImages", true],
    ["editorPaddingX", "2", "editorPaddingX", 2],
    ["autocompleteMaxVisible", "10", "autocompleteMaxVisible", 10],
  ];
  for (const [key, value, field, expected] of cases) {
    const next = await store.set(key, value);
    assert.equal(next[field], expected, `${key} -> ${field}`);
  }
});

test("set ignores unknown keys and bad idle labels", async () => {
  const store = makeStore();
  await store.set("nope", "x");
  await store.set("httpIdleTimeout", "not-a-label");
  assert.deepEqual(store.get(), defaultPitSettings());
});

test("enabled models round-trip through the manager", async () => {
  const store = makeStore();
  await store.setEnabledModels(["anthropic/*"]);
  assert.deepEqual(store.getEnabledModels(), ["anthropic/*"]);
  await store.setEnabledModels(undefined);
  assert.equal(store.getEnabledModels(), undefined);
});
