import assert from "node:assert/strict";
import { test } from "node:test";
import { defaultPitSettings, settingsItems, themeSelectItems } from "./index.ts";

test("theme selector marks the current theme", () => {
  const { items, initialIndex } = themeSelectItems("light");
  assert.equal(initialIndex, 1);
  assert.deepEqual(items.map((item) => item.value), ["dark", "light", "tokyo-night"]);
  assert.equal(items[1]!.description, "(current)");
});

test("settings list covers pi parity settings that affect pit", () => {
  const items = settingsItems(defaultPitSettings());
  assert.deepEqual(items.map((item) => item.id), [
    "theme", "autoCompact", "steeringMode", "followUpMode", "transport", "httpIdleTimeout",
    "hideThinkingBlock", "defaultProjectTrust", "treeFilterMode",
    "showImages", "imageWidthCells", "autoResizeImages", "blockImages",
    "editorPaddingX", "autocompleteMaxVisible",
  ]);
});

test("settings items render current values from settings", () => {
  const items = settingsItems({ ...defaultPitSettings(), editorPaddingX: 1, httpIdleTimeoutMs: 60_000, steeringMode: "all" });
  assert.equal(items.find((item) => item.id === "editorPaddingX")?.currentValue, "1");
  assert.equal(items.find((item) => item.id === "httpIdleTimeout")?.currentValue, "1 min");
  assert.equal(items.find((item) => item.id === "steeringMode")?.currentValue, "all");
  assert.equal(items.find((item) => item.id === "autoCompact")?.currentValue, "true");
});

test("defaults match pi's SettingsManager defaults", () => {
  const d = defaultPitSettings();
  assert.equal(d.steeringMode, "one-at-a-time");
  assert.equal(d.transport, "auto");
  assert.equal(d.httpIdleTimeoutMs, 300_000);
  assert.equal(d.defaultProjectTrust, "ask");
  assert.equal(d.treeFilterMode, "default");
  assert.equal(d.imageWidthCells, 60);
});
