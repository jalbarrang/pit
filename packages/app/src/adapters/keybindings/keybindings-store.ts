import { KeybindingsManager, setKeybindings, type KeybindingsConfig } from "@pit/tui";
import { toKeybindingsConfig } from "../../domain/keybindings/index.ts";
import { resolveDefinitions, resolveMigrate } from "./upstream-defs.ts";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export interface KeybindingsStoreDeps {
  readFile?: (path: string) => string | undefined;
  configPath?: string;
}

export class KeybindingsStore {
  private readonly deps: KeybindingsStoreDeps;
  constructor(deps: KeybindingsStoreDeps = {}) {
    this.deps = deps;
  }

  private path(): string {
    return this.deps.configPath ?? join(homedir(), ".pi", "agent", "keybindings.json");
  }

  private read(): string | undefined {
    if (this.deps.readFile) return this.deps.readFile(this.path());
    const p = this.path();
    return existsSync(p) ? readFileSync(p, "utf-8") : undefined;
  }

  load(): KeybindingsConfig {
    const raw = this.read();
    if (!raw) return {};
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {};
    }
    if (typeof parsed !== "object" || parsed === null) return {};
    return toKeybindingsConfig(resolveMigrate()(parsed as Record<string, unknown>).config);
  }

  install(): KeybindingsManager {
    const mgr = new KeybindingsManager(resolveDefinitions(), this.load());
    setKeybindings(mgr);
    return mgr;
  }

  reload(mgr: KeybindingsManager): void {
    mgr.setUserBindings(this.load());
  }
}
