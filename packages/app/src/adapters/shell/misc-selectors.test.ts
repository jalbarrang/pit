import assert from "node:assert/strict";
import { test } from "node:test";
import { KeybindingsManager, setKeybindings, TUI_KEYBINDINGS, type SelectItem } from "@pit/tui";
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

test("openHelp lists keybindings from the installed manager", () => {
  const defs = {
    "test.alpha": { defaultKeys: "a", description: "Alpha" },
    "test.beta": { defaultKeys: ["b", "c"], description: "Beta" },
  };
  setKeybindings(new KeybindingsManager(defs as never, {}));
  try {
    const overlays: FakeOverlay[] = [];
    const tui = { ctx: {}, renderer: { width: 80 }, showOverlay: () => ({ hide: () => {} }) };
    const selectors = new MiscSelectors({ tui: () => tui as never, trust: () => undefined, notify: () => {} }, (_ctx, options) => {
      const overlay = new FakeOverlay(options); overlays.push(overlay); return overlay as never;
    });
    selectors.openHelp();
    assert.deepEqual(overlays[0]!.options.items.map((i) => i.value).sort(), ["test.alpha", "test.beta"]);
    assert.equal(overlays[0]!.options.items.find((i) => i.value === "test.alpha")?.label, "a");
    assert.equal(overlays[0]!.options.items.find((i) => i.value === "test.beta")?.label, "b, c");
  } finally {
    setKeybindings(new KeybindingsManager(TUI_KEYBINDINGS));
  }
});
