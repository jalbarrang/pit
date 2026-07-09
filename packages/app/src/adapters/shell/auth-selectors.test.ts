import assert from "node:assert/strict";
import { test } from "node:test";
import type { SelectItem } from "@pit/tui";
import { AuthSelectors } from "./auth-selectors.ts";

class FakeSelect { onSelect?: (item: SelectItem) => void; onCancel?: () => void; readonly options: { items: SelectItem[] }; constructor(options: { items: SelectItem[] }) { this.options = options; } setWidth() {} }
class FakeInput { onSubmit?: (value: string) => void; onCancel?: () => void; masked = false; setWidth() {} }

test("login selector opens providers and saves API key through masked input", async () => {
  const log: string[] = [];
  let hidden = 0;
  const selects: FakeSelect[] = [];
  const inputs: FakeInput[] = [];
  const auth = {
    providers: () => [{ id: "anthropic", name: "Anthropic", authType: "api_key" as const }],
    setApiKey: async (provider: string, key: string) => void log.push(`key:${provider}:${key}`),
  };
  const tui = { ctx: {}, renderer: { width: 80 }, showOverlay: () => ({ hide: () => void (hidden += 1) }) };
  const selectors = new AuthSelectors({ tui: () => tui as never, auth: () => auth as never, notify: (text) => void log.push(text), onAuthConfigured: async () => void log.push("configured") }, (_ctx, options) => {
    const overlay = new FakeSelect(options); selects.push(overlay); return overlay as never;
  }, () => { const overlay = new FakeInput(); overlay.masked = true; inputs.push(overlay); return overlay as never; });
  selectors.openLogin();
  selects[0]!.onSelect?.({ value: "anthropic", label: "Anthropic" });
  inputs[0]!.onSubmit?.(" sk-test ");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(inputs[0]!.masked, true);
  assert.equal(hidden, 2);
  assert.deepEqual(log, ["key:anthropic:sk-test", "Login saved for anthropic", "configured"]);
});
