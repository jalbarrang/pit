import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHost, settle } from "./selectors-fixture.ts";

const scopedSession = { scopedModels: () => [{ provider: "openai", id: "gpt-5.5" }] };

test("openModel without scoped models has no scope header or tab handler", () => {
  const { selectors, overlays } = makeHost();
  selectors.openModel("");
  assert.equal(overlays[0]!.options.header, undefined);
  assert.equal(overlays[0]!.onTab, undefined);
});

test("openModel defaults to scoped list when scoped models exist", () => {
  const { selectors, overlays } = makeHost(scopedSession);
  selectors.openModel("");
  const overlay = overlays[0]!;
  assert.deepEqual(overlay.options.items.map((item) => item.value), ["openai/gpt-5.5"]);
  assert.notEqual(overlay.options.header, undefined);
});

test("tab toggles between scoped and all model lists", () => {
  const { selectors, overlays } = makeHost(scopedSession);
  selectors.openModel("");
  const overlay = overlays[0]!;
  const scopedHeader = overlay.header;
  overlay.onTab?.();
  assert.deepEqual(overlay.items.map((item) => item.value), ["anthropic/claude-opus-4-8", "openai/gpt-5.5"]);
  assert.equal(overlay.selectedIndex, 1);
  assert.notEqual(overlay.header, scopedHeader);
  overlay.onTab?.();
  assert.deepEqual(overlay.items.map((item) => item.value), ["openai/gpt-5.5"]);
});

test("selecting a scoped model applies it even when scoped list is active", async () => {
  const { selectors, log, overlays } = makeHost(scopedSession);
  selectors.openModel("");
  overlays[0]!.onSelect?.({ value: "openai/gpt-5.5", label: "x" });
  await settle();
  assert.deepEqual(log, ["setModel:openai/gpt-5.5", "notify:Model: openai/gpt-5.5", "footer"]);
});
