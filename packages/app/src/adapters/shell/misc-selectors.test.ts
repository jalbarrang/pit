import assert from "node:assert/strict";
import { test } from "node:test";
import type { SelectItem } from "@pit/tui";
import { MiscSelectors } from "./misc-selectors.ts";

class FakeOverlay { onSelect?: (item: SelectItem) => void; onCancel?: () => void; readonly options: { items: SelectItem[] }; constructor(options: { items: SelectItem[] }) { this.options = options; } setWidth() {} }

test("trust selector persists the chosen trust decision", () => {
  const log: string[] = [];
  const overlays: FakeOverlay[] = [];
  const trust = { setTrusted: (trusted: boolean) => void log.push(`trust:${trusted}`) };
  const tui = { ctx: {}, renderer: { width: 80 }, showOverlay: () => ({ hide: () => void log.push("hide") }) };
  const selectors = new MiscSelectors({ tui: () => tui as never, trust: () => trust as never, notify: (text) => void log.push(text) }, (_ctx, options) => {
    const overlay = new FakeOverlay(options); overlays.push(overlay); return overlay as never;
  });
  selectors.openTrust();
  overlays[0]!.onSelect?.({ value: "trust", label: "Trust" });
  assert.deepEqual(log, ["hide", "trust:true", "Project trusted"]);
});
