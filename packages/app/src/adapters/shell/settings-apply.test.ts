import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHost, settle } from "./selectors-fixture.ts";

test("openSettings lists parity items and persists changes", async () => {
  const { selectors, log, settingsOverlays } = makeHost();
  selectors.openSettings();
  const overlay = settingsOverlays[0]!;
  assert.ok(overlay.items.some((item) => item.id === "steeringMode"));
  overlay.onChange?.("steeringMode", "all");
  await settle();
  assert.deepEqual(log, ["setting:steeringMode:all", "session:steeringMode:all", "footer"]);
  assert.deepEqual(overlay.updates, ["steeringMode=all"]);
});

test("theme change repaints, non-runtime settings skip session", async () => {
  const { selectors, log, settingsOverlays } = makeHost();
  selectors.openSettings();
  settingsOverlays[0]!.onChange?.("theme", "light");
  await settle();
  assert.deepEqual(log, ["setting:theme:light", "theme:light", "session:theme:light", "footer"]);
});

test("hideThinkingBlock toggles live thinking visibility", async () => {
  const { selectors, log, settingsOverlays } = makeHost();
  selectors.openSettings();
  settingsOverlays[0]!.onChange?.("hideThinkingBlock", "true");
  await settle();
  assert.ok(log.includes("thinkingVisible:false"));
  settingsOverlays[0]!.onChange?.("hideThinkingBlock", "false");
  await settle();
  assert.ok(log.includes("thinkingVisible:true"));
});
