import assert from "node:assert/strict";
import { test } from "node:test";
import { makeHost, settle } from "./selectors-fixture.ts";

test("openSessions lists sessions newest-first and switches on select", async () => {
  const { selectors, log, overlays } = makeHost();
  await selectors.openSessions();
  assert.deepEqual(overlays[0]!.options.items.map((item) => item.value), ["/s/current.jsonl", "/s/other.jsonl"]);
  assert.equal(overlays[0]!.options.searchable, true);
  overlays[0]!.onSelect?.({ value: "/s/other.jsonl", label: "x" });
  await settle();
  assert.deepEqual(log, ["switch:/s/other.jsonl", "notify:Resumed session", "footer"]);
});

test("selecting the current session is a no-op notify", async () => {
  const { selectors, log, overlays } = makeHost();
  await selectors.openSessions();
  overlays[0]!.onSelect?.({ value: "/s/current.jsonl", label: "x" });
  await settle();
  assert.deepEqual(log, ["notify:Already on that session.", "footer"]);
});
