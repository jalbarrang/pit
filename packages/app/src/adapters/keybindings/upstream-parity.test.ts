import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "node:test";
import * as sdk from "@earendil-works/pi-coding-agent";
import { TUI_KEYBINDINGS as UP_TUI } from "@earendil-works/pi-tui";
import { TUI_KEYBINDINGS as PIT_TUI } from "@pit/tui";
import { APP_KEYBINDINGS } from "../../domain/keybindings/index.ts";

type Keys = string | string[] | undefined;
type Defs = Record<string, { defaultKeys?: Keys }>;

const normalize = (keys: Keys): string[] => [...(keys === undefined ? [] : Array.isArray(keys) ? keys : [keys])].sort();

const assertParity = (pit: Defs, up: Defs, label: string): void => {
  const pitIds = Object.keys(pit).sort();
  const upIds = Object.keys(up).sort();
  const missing = upIds.filter((id) => !(id in pit));
  const extra = pitIds.filter((id) => !(id in up));
  assert.equal(missing.length + extra.length, 0, `${label} id drift: missing=[${missing}] extra=[${extra}]`);
  for (const id of pitIds) {
    assert.deepEqual(normalize(pit[id]?.defaultKeys), normalize(up[id]?.defaultKeys), `${label} ${id} defaultKeys`);
  }
};

const appOnly = (defs: Defs): Defs => Object.fromEntries(Object.entries(defs).filter(([id]) => id.startsWith("app.")));

describe("upstream TUI_KEYBINDINGS parity", () => {
  it("matches id sets and normalized defaultKeys", () => {
    assertParity(PIT_TUI as Defs, UP_TUI as Defs, "TUI_KEYBINDINGS");
  });
});

/** The SDK does not export KEYBINDINGS from its root; the exports map blocks bare-specifier deep
 * imports, but direct file paths bypass it. If the dist layout changes on an upgrade, this fails
 * loudly — which is the tripwire doing its job (adjust the path then). */
const upstreamAppDefs = async (): Promise<Defs> => {
  const fromRoot = (sdk as Record<string, unknown>).KEYBINDINGS;
  if (fromRoot && typeof fromRoot === "object") return fromRoot as Defs;
  const store = resolve(process.cwd(), "node_modules/.pnpm");
  const dir = readdirSync(store).find((d) => d.startsWith("@earendil-works+pi-coding-agent@"));
  assert.ok(dir, "pi-coding-agent not found in the pnpm store — parity tripwire cannot run");
  const file = resolve(store, dir, "node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js");
  const mod = (await import(file)) as { KEYBINDINGS?: Defs };
  assert.ok(mod.KEYBINDINGS, "dist/core/keybindings.js no longer exposes KEYBINDINGS — update this tripwire");
  return mod.KEYBINDINGS;
};

describe("upstream app.* KEYBINDINGS parity", () => {
  it("matches app.* id sets and normalized defaultKeys", async () => {
    assertParity(appOnly(APP_KEYBINDINGS as Defs), appOnly(await upstreamAppDefs()), "app.*");
  });
});
