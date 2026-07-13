import assert from "node:assert/strict";
import { test } from "node:test";
import type { SettingsManager } from "@earendil-works/pi-coding-agent";
import { SettingsStore } from "./settings-store.ts";

const fakeManager = (theme: string | undefined): SettingsManager =>
  new Proxy({}, { get: (_t, prop) => (prop === "getTheme" ? () => theme : () => undefined) }) as unknown as SettingsManager;

test("settings store round-trips every pit theme name, not just light", () => {
  for (const theme of ["dark", "light", "tokyo-night"]) {
    assert.equal(new SettingsStore(process.cwd(), fakeManager(theme)).get().theme, theme);
  }
});

test("settings store falls back to dark for unknown or missing themes", () => {
  assert.equal(new SettingsStore(process.cwd(), fakeManager("solarized")).get().theme, "dark");
  assert.equal(new SettingsStore(process.cwd(), fakeManager(undefined)).get().theme, "dark");
});
