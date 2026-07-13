import type { SelectItem, SettingItem } from "@pit/tui";
import { defaultPitSettings } from "../../domain/chrome/index.ts";
import { ChromeSelectors, type SelectorHost } from "./selectors.ts";

export class FakeOverlay {
  onSelect?: (item: SelectItem) => void;
  onCancel?: () => void;
  onSelectionChange?: (item: SelectItem) => void;
  onTab?: () => void;
  readonly options: { items: SelectItem[]; initialIndex?: number; searchable?: boolean; initialSearch?: string; header?: unknown };
  items: SelectItem[];
  selectedIndex: number;
  header?: unknown;
  constructor(options: { items: SelectItem[]; initialIndex?: number; searchable?: boolean; initialSearch?: string; header?: unknown }) {
    this.options = options;
    this.items = options.items;
    this.selectedIndex = options.initialIndex ?? 0;
    this.header = options.header;
  }
  setWidth(): void {}
  setItems(items: SelectItem[], selectedIndex = 0): void { this.items = items; this.selectedIndex = selectedIndex; }
  setHeader(content: unknown): void { this.header = content; }
}

export class FakeSettingsOverlay {
  onChange?: (id: string, value: string) => void;
  onCancel?: () => void;
  readonly items: SettingItem[];
  readonly updates: string[] = [];
  constructor(items: SettingItem[]) { this.items = items; }
  setWidth(): void {}
  updateValue(id: string, value: string): void { this.updates.push(`${id}=${value}`); }
}

export const makeHost = (sessionOverrides: Record<string, unknown> = {}) => {
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
    sessionPath: "/s/current.jsonl",
    listModels: () => [{ provider: "anthropic", id: "claude-opus-4-8" }, { provider: "openai", id: "gpt-5.5" }],
    setModel: async (ref: { provider: string; id: string }) => void log.push(`setModel:${ref.provider}/${ref.id}`),
    availableThinkingLevels: () => ["off", "low", "high"],
    setThinkingLevel: (level: string) => void log.push(`setThinking:${level}`),
    applySessionSetting: (id: string, value: string) => { log.push(`session:${id}:${value}`); return id === "steeringMode" || id === "followUpMode" || id === "autoCompact"; },
    ...sessionOverrides,
  };
  const host: SelectorHost = {
    tui: () => tui as never,
    session: () => session as never,
    notify: (text) => void log.push(`notify:${text}`),
    refreshFooter: () => void log.push("footer"),
    settings: () => defaultPitSettings(),
    setSetting: async (id, value) => { log.push(`setting:${id}:${value}`); return { ...defaultPitSettings(), theme: value === "light" ? "light" : "dark" }; },
    applyTheme: (theme) => void log.push(`theme:${theme}`),
    setThinkingVisible: (visible) => void log.push(`thinkingVisible:${visible}`),
    listSessions: async () => [
      { path: "/s/current.jsonl", id: "c", firstMessage: "current work", modified: new Date(2), messageCount: 5 },
      { path: "/s/other.jsonl", id: "o", firstMessage: "other work", modified: new Date(1), messageCount: 9 },
    ],
    switchSession: async (path) => void log.push(`switch:${path}`),
  };
  const settingsOverlays: FakeSettingsOverlay[] = [];
  const selectors = new ChromeSelectors(host, (_ctx, options) => {
    const overlay = new FakeOverlay(options);
    overlays.push(overlay);
    return overlay as never;
  }, (_ctx, options) => {
    const overlay = new FakeSettingsOverlay(options.items);
    settingsOverlays.push(overlay);
    return overlay as never;
  });
  return { selectors, log, overlays, settingsOverlays, hidden: () => hidden, host };
};

export const settle = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));
