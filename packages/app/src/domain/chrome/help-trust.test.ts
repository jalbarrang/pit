import assert from "node:assert/strict";
import { test } from "node:test";
import { findTrustChoice, keybindingHelpItems, trustItems } from "./index.ts";

test("help lists daily chrome keybindings", () => {
  const items = keybindingHelpItems();
  assert.ok(items.some((item) => item.label === "/"));
  assert.ok(items.some((item) => item.label === "Ctrl+C Ctrl+C"));
});

test("trust selector maps choices to decisions", () => {
  assert.deepEqual(trustItems().map((item) => item.value), ["trust", "untrust"]);
  assert.equal(findTrustChoice("trust")?.trusted, true);
  assert.equal(findTrustChoice("untrust")?.trusted, false);
});
