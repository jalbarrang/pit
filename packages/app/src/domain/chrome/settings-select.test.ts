import assert from "node:assert/strict";
import { test } from "node:test";
import { settingsItems, themeSelectItems } from "./index.ts";

test("theme selector marks the current theme", () => {
  const { items, initialIndex } = themeSelectItems("light");
  assert.equal(initialIndex, 1);
  assert.deepEqual(items.map((item) => item.value), ["dark", "light"]);
  assert.equal(items[1]!.description, "(current)");
});

test("settings list includes only pit-applicable settings", () => {
  const items = settingsItems({ theme: "dark", showImages: false, autoResizeImages: true, blockImages: false, editorPaddingX: 1, autocompleteMaxVisible: 10 });
  assert.deepEqual(items.map((item) => item.id), ["theme", "showImages", "autoResizeImages", "blockImages", "editorPaddingX", "autocompleteMaxVisible"]);
  assert.equal(items.find((item) => item.id === "editorPaddingX")?.currentValue, "1");
});
