import type { KeyId, KeybindingsConfig } from "@pit/tui";
import { APP_KEYBINDINGS } from "./definitions.ts";
import { KEYBINDING_NAME_MIGRATIONS } from "./migrations-names.ts";

function isLegacyKeybindingName(key: string): key is keyof typeof KEYBINDING_NAME_MIGRATIONS {
  return key in KEYBINDING_NAME_MIGRATIONS;
}

export function toKeybindingsConfig(value: Record<string, unknown>): KeybindingsConfig {
  const config: KeybindingsConfig = {};
  for (const [key, binding] of Object.entries(value)) {
    if (typeof binding === "string") {
      config[key] = binding as KeyId;
      continue;
    }
    if (Array.isArray(binding) && binding.every((entry) => typeof entry === "string")) {
      config[key] = binding as KeyId[];
    }
  }
  return config;
}

export function orderKeybindingsConfig(config: Record<string, unknown>): Record<string, unknown> {
  const ordered: Record<string, unknown> = {};
  for (const keybinding of Object.keys(APP_KEYBINDINGS)) {
    if (Object.hasOwn(config, keybinding)) ordered[keybinding] = config[keybinding];
  }
  const extras = Object.keys(config).filter((key) => !Object.hasOwn(ordered, key)).sort();
  for (const key of extras) ordered[key] = config[key];
  return ordered;
}

export function migrateKeybindingsConfig(rawConfig: Record<string, unknown>): {
  config: Record<string, unknown>;
  migrated: boolean;
} {
  const config: Record<string, unknown> = {};
  let migrated = false;
  for (const [key, value] of Object.entries(rawConfig)) {
    const nextKey = isLegacyKeybindingName(key) ? KEYBINDING_NAME_MIGRATIONS[key] : key;
    if (nextKey !== key) migrated = true;
    if (key !== nextKey && Object.hasOwn(rawConfig, nextKey)) {
      migrated = true;
      continue;
    }
    config[nextKey] = value;
  }
  return { config: orderKeybindingsConfig(config), migrated };
}

export { KEYBINDING_NAME_MIGRATIONS };
