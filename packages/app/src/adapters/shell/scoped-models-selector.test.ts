import assert from "node:assert/strict";
import { test } from "node:test";
import type { ScopedModelsOverlayOptions } from "../../components/chrome/scoped-models-overlay.ts";
import { ScopedModelsSelectors } from "./scoped-models-selector.ts";

class FakeOverlay {
  onChange?: (enabled: string[] | null) => void;
  onPersist?: (enabled: string[] | null) => void;
  onCancel?: () => void;
  readonly options: ScopedModelsOverlayOptions;
  constructor(options: ScopedModelsOverlayOptions) { this.options = options; }
  setWidth() {}
}

const make = () => {
  const log: string[] = [];
  const overlays: FakeOverlay[] = [];
  let scoped: Array<{ provider: string; id: string }> | null = null;
  const session = {
    listModels: () => [{ provider: "anthropic", id: "claude-opus-4-8" }, { provider: "openai", id: "gpt-4o" }],
    scopedModels: () => scoped ?? [],
    setScopedModels: (refs: Array<{ provider: string; id: string }> | null) => {
      scoped = refs;
      log.push(`scoped:${refs === null ? "null" : refs.map((r) => `${r.provider}/${r.id}`).join(",")}`);
    },
  };
  const settings = { setEnabledModels: async (patterns: string[] | undefined) => { log.push(`settings:${patterns === undefined ? "undefined" : patterns.join(",")}`); } };
  const tui = { ctx: {}, renderer: { width: 80 }, showOverlay: () => ({ hide: () => void log.push("hide") }) };
  const selectors = new ScopedModelsSelectors(
    { tui: () => tui as never, session: () => session as never, settings: () => settings, notify: (text) => void log.push(text) },
    (_ctx, options) => { const overlay = new FakeOverlay(options); overlays.push(overlay); return overlay as never; },
  );
  return { selectors, overlays, log, setScoped: (refs: typeof scoped) => { scoped = refs; } };
};

test("openScopedModels builds items from listModels with null initial when no scope", () => {
  const { selectors, overlays } = make();
  selectors.openScopedModels();
  assert.equal(overlays.length, 1);
  assert.deepEqual(overlays[0]!.options.items, [
    { id: "anthropic/claude-opus-4-8", label: "anthropic/claude-opus-4-8", provider: "anthropic" },
    { id: "openai/gpt-4o", label: "openai/gpt-4o", provider: "openai" },
  ]);
  assert.equal(overlays[0]!.options.initial, null);
});

test("openScopedModels seeds initial from scopedModels when non-empty", () => {
  const { selectors, overlays, setScoped } = make();
  setScoped([{ provider: "openai", id: "gpt-4o" }]);
  selectors.openScopedModels();
  assert.deepEqual(overlays[0]!.options.initial, ["openai/gpt-4o"]);
});

test("onChange maps id strings to ModelRefs; null passes null", () => {
  const { selectors, overlays, log } = make();
  selectors.openScopedModels();
  overlays[0]!.onChange?.(["openai/gpt-4o"]);
  overlays[0]!.onChange?.(null);
  assert.deepEqual(log, ["scoped:openai/gpt-4o", "scoped:null"]);
});

test("onPersist writes settings patterns (null → undefined) and notifies", async () => {
  const { selectors, overlays, log } = make();
  selectors.openScopedModels();
  overlays[0]!.onPersist?.(["anthropic/claude-opus-4-8"]);
  overlays[0]!.onPersist?.(null);
  await Promise.resolve(); await Promise.resolve();
  assert.deepEqual(log, ["settings:anthropic/claude-opus-4-8", "settings:undefined", "Model scope saved", "Model scope saved"]);
});

test("onCancel hides the overlay", () => {
  const { selectors, overlays, log } = make();
  selectors.openScopedModels();
  overlays[0]!.onCancel?.();
  assert.deepEqual(log, ["hide"]);
});

test("missing listModels notifies Models unavailable", () => {
  const log: string[] = [];
  const selectors = new ScopedModelsSelectors({
    tui: () => ({}) as never, session: () => ({}) as never,
    settings: () => ({ setEnabledModels: async () => {} }), notify: (text) => void log.push(text),
  });
  selectors.openScopedModels();
  assert.deepEqual(log, ["Models unavailable"]);
});
