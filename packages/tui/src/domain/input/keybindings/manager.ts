import { matchesKey, type KeyId } from "../key-chord.ts";
import type { Keybinding, KeybindingConflict, KeybindingDefinition, KeybindingDefinitions, KeybindingsConfig } from "./types.ts";
import { TUI_KEYBINDINGS } from "./defaults.ts";

const normalizeKeys = (keys: KeyId | KeyId[] | undefined): KeyId[] => {
  const list = keys === undefined ? [] : Array.isArray(keys) ? keys : [keys];
  return [...new Set(list)];
};

export class KeybindingsManager {
  private keysById = new Map<Keybinding, KeyId[]>();
  private conflicts: KeybindingConflict[] = [];
  private definitions: KeybindingDefinitions;
  private userBindings: KeybindingsConfig;
  constructor(definitions: KeybindingDefinitions, userBindings: KeybindingsConfig = {}) {
    this.definitions = definitions;
    this.userBindings = userBindings;
    this.rebuild();
  }
  private rebuild(): void {
    this.keysById.clear();
    this.conflicts = [];
    const claims = new Map<KeyId, Set<Keybinding>>();
    for (const [id, keys] of Object.entries(this.userBindings)) {
      if (!(id in this.definitions)) continue;
      for (const key of normalizeKeys(keys)) {
        const set = claims.get(key) ?? new Set<Keybinding>();
        set.add(id as Keybinding);
        claims.set(key, set);
      }
    }
    for (const [key, keybindings] of claims) if (keybindings.size > 1) this.conflicts.push({ key, keybindings: [...keybindings] });
    for (const [id, definition] of Object.entries(this.definitions)) {
      const userKeys = this.userBindings[id];
      this.keysById.set(id as Keybinding, userKeys === undefined ? normalizeKeys(definition.defaultKeys) : normalizeKeys(userKeys));
    }
  }
  matches(data: string, keybinding: Keybinding): boolean {
    return (this.keysById.get(keybinding) ?? []).some((key) => matchesKey(data, key));
  }
  getKeys(keybinding: Keybinding): KeyId[] {
    return [...(this.keysById.get(keybinding) ?? [])];
  }
  getDefinition(keybinding: Keybinding): KeybindingDefinition {
    return this.definitions[keybinding];
  }
  getConflicts(): KeybindingConflict[] {
    return this.conflicts.map((conflict) => ({ ...conflict, keybindings: [...conflict.keybindings] }));
  }
  setUserBindings(userBindings: KeybindingsConfig): void {
    this.userBindings = userBindings;
    this.rebuild();
  }
  getUserBindings(): KeybindingsConfig {
    return { ...this.userBindings };
  }
  getResolvedBindings(): KeybindingsConfig {
    return Object.fromEntries(Object.keys(this.definitions).map((id) => {
      const keys = this.getKeys(id as Keybinding);
      return [id, keys.length === 1 ? keys[0] : keys];
    }));
  }
}

let globalKeybindings: KeybindingsManager | null = null;
export const setKeybindings = (keybindings: KeybindingsManager): void => { globalKeybindings = keybindings; };
export const getKeybindings = (): KeybindingsManager => globalKeybindings ??= new KeybindingsManager(TUI_KEYBINDINGS);
