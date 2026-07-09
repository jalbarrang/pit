import assert from "node:assert/strict";
import { test } from "node:test";
import type { SelectItem } from "@pit/tui";
import { ChromeSelectors, type SelectorHost } from "./selectors.ts";

class FakeOverlay {
  onSelect?: (item: SelectItem) => void;
  onCancel?: () => void;
  readonly options: { items: SelectItem[]; initialIndex?: number; searchable?: boolean; initialSearch?: string };
  constructor(options: { items: SelectItem[]; initialIndex?: number; searchable?: boolean; initialSearch?: string }) { this.options = options; }
  setWidth(): void {}
}

const makeHost = () => {
  const log: string[] = [];
  let hidden = 0;
  const overlays: FakeOverlay[] = [];
  const tui = {
    ctx: {},
    renderer: { width: 100 },
    showOverlay: () => ({ hide: () => void (hidden += 1) }),
  };
  const session = {
    modelId: "openai/gpt-5.5",
    thinkingLevel: "high",
    listModels: () => [{ provider: "anthropic", id: "claude-opus-4-8" }, { provider: "openai", id: "gpt-5.5" }],
    setModel: async (ref: { provider: string; id: string }) => void log.push(`setModel:${ref.provider}/${ref.id}`),
    availableThinkingLevels: () => ["off", "low", "high"],
    setThinkingLevel: (level: string) => void log.push(`setThinking:${level}`),
  };
  const host: SelectorHost = {
    tui: () => tui as never,
    session: () => session as never,
    notify: (text) => void log.push(`notify:${text}`),
    refreshFooter: () => void log.push("footer"),
  };
  const selectors = new ChromeSelectors(host, (_ctx, options) => {
    const overlay = new FakeOverlay(options);
    overlays.push(overlay);
    return overlay as never;
  });
  return { selectors, log, overlays, hidden: () => hidden, host };
};

test("openModel shows searchable overlay preselecting current model", () => {
  const { selectors, overlays } = makeHost();
  selectors.openModel("gpt");
  assert.equal(overlays.length, 1);
  assert.equal(overlays[0]!.options.searchable, true);
  assert.equal(overlays[0]!.options.initialSearch, "gpt");
  assert.equal(overlays[0]!.options.initialIndex, 1);
});

test("selecting a model applies it, notifies, refreshes footer, hides overlay", async () => {
  const { selectors, log, overlays, hidden } = makeHost();
  selectors.openModel("");
  overlays[0]!.onSelect?.({ value: "anthropic/claude-opus-4-8", label: "x" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(hidden(), 1);
  assert.deepEqual(log, ["setModel:anthropic/claude-opus-4-8", "notify:Model: anthropic/claude-opus-4-8", "footer"]);
});

test("openThinking lists levels and applies selection", async () => {
  const { selectors, log, overlays } = makeHost();
  selectors.openThinking();
  assert.deepEqual(overlays[0]!.options.items.map((item) => item.value), ["off", "low", "high"]);
  assert.equal(overlays[0]!.options.initialIndex, 2);
  overlays[0]!.onSelect?.({ value: "low", label: "low" });
  await new Promise((resolve) => setImmediate(resolve));
  assert.deepEqual(log, ["setThinking:low", "notify:Thinking: low", "footer"]);
});

test("cancel hides without applying", () => {
  const { selectors, log, overlays, hidden } = makeHost();
  selectors.openThinking();
  overlays[0]!.onCancel?.();
  assert.equal(hidden(), 1);
  assert.deepEqual(log, []);
});

test("no session notifies instead of opening", () => {
  const { log, overlays } = makeHost();
  const selectors = new ChromeSelectors({ tui: () => ({}) as never, session: () => undefined, notify: (t) => void log.push(t), refreshFooter: () => {} });
  selectors.openModel("");
  selectors.openThinking();
  assert.equal(overlays.length, 0);
  assert.equal(log.length, 2);
});
