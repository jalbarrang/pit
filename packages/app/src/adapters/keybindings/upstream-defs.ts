import * as sdk from "@earendil-works/pi-coding-agent";
import { TUI_KEYBINDINGS as UPSTREAM_TUI } from "@earendil-works/pi-tui";
import type { KeybindingDefinitions } from "@pit/tui";
import { APP_KEYBINDINGS, migrateKeybindingsConfig } from "../../domain/keybindings/index.ts";

const sdkExports = sdk as unknown as Record<string, unknown>;

export function resolveDefinitions(): KeybindingDefinitions {
  const up = sdkExports.KEYBINDINGS;
  if (up && typeof up === "object") return up as KeybindingDefinitions;
  const appOnly = Object.fromEntries(Object.entries(APP_KEYBINDINGS).filter(([id]) => id.startsWith("app.")));
  return { ...(UPSTREAM_TUI as unknown as KeybindingDefinitions), ...appOnly };
}

export function resolveMigrate(): (raw: Record<string, unknown>) => { config: Record<string, unknown>; migrated: boolean } {
  const up = sdkExports.migrateKeybindingsConfig;
  return typeof up === "function" ? (up as never) : migrateKeybindingsConfig;
}
