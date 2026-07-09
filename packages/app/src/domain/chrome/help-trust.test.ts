import assert from "node:assert/strict";
import { test } from "node:test";
import { findTrustChoice, keybindingHelpItems, trustItems } from "./index.ts";

test("help maps keybinding entries to select items", () => {
  const items = keybindingHelpItems([
    { id: "app.tools.expand", keys: ["ctrl+o"], description: "Toggle tool output" },
    { id: "app.exit", keys: ["ctrl+c", "ctrl+c"], description: "Exit pit" },
    { id: "unbound.action", keys: [] },
  ]);
  assert.deepEqual(items, [
    { value: "app.tools.expand", label: "ctrl+o", description: "Toggle tool output" },
    { value: "app.exit", label: "ctrl+c, ctrl+c", description: "Exit pit" },
    { value: "unbound.action", label: "(unbound)", description: undefined },
  ]);
});

test("trust selector maps choices to decisions", () => {
  assert.deepEqual(trustItems().map((item) => item.value), ["trust", "untrust"]);
  assert.equal(findTrustChoice("trust")?.trusted, true);
  assert.equal(findTrustChoice("untrust")?.trusted, false);
});
