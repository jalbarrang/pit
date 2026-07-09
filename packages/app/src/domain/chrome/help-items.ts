import type { SelectItem } from "@pit/tui";

export interface KeybindingHelpEntry {
  id: string;
  keys: string[];
  description?: string;
}

export const keybindingHelpItems = (entries: KeybindingHelpEntry[]): SelectItem[] =>
  entries.map(({ id, keys, description }) => ({
    value: id,
    label: keys.length ? keys.join(", ") : "(unbound)",
    description,
  }));
