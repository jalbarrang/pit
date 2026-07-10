import assert from "node:assert/strict";
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

describe("upstream app.* KEYBINDINGS parity", () => {
  const up = (sdk as Record<string, unknown>).KEYBINDINGS;
  if (!up || typeof up !== "object") {
    it.skip("app.* parity activates once the SDK exports KEYBINDINGS", () => {});
  } else {
    it("matches app.* id sets and normalized defaultKeys", () => {
      assertParity(appOnly(APP_KEYBINDINGS as Defs), appOnly(up as Defs), "app.*");
    });
  }
});
