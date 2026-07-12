import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { SettingsOverlay, type SettingsOverlayOptions } from "../../components/chrome/settings-overlay.ts";
import { SelectorOverlay, type SelectorOverlayOptions } from "../../components/chrome/selector-overlay.ts";
import { findModel, isThemeName, modelSelectItems, sessionSelectItems, settingsItems, themeSelectItems, thinkingSelectItems, type PitSettings } from "../../domain/chrome/index.ts";
import { createTheme, type ThemeName } from "../../domain/theming/index.ts";
import type { SessionGateway, SessionSummary } from "../../domain/index.ts";
import { applySettingChange } from "./settings-apply.ts";

export interface SelectorHost {
  tui(): TUI;
  session(): SessionGateway | undefined;
  notify(text: string): void;
  refreshFooter(): void;
  settings(): PitSettings;
  setSetting(id: string, value: string): Promise<PitSettings>;
  applyTheme(theme: ThemeName): void;
  setThinkingVisible?(visible: boolean): void;
  listSessions?(): Promise<SessionSummary[]>;
  switchSession?(path: string): Promise<void>;
}

type OverlayFactory = (ctx: RenderContext, options: SelectorOverlayOptions) => SelectorOverlay;
type SettingsFactory = (ctx: RenderContext, options: SettingsOverlayOptions) => SettingsOverlay;
const selectFactory: OverlayFactory = (ctx, options) => new SelectorOverlay(ctx, options);
const settingsFactory: SettingsFactory = (ctx, options) => new SettingsOverlay(ctx, options);

export class ChromeSelectors {
  private readonly host: SelectorHost;
  private readonly factory: OverlayFactory;
  private readonly settingsOverlay: SettingsFactory;
  constructor(host: SelectorHost, factory = selectFactory, settingsOverlay = settingsFactory) {
    this.host = host; this.factory = factory; this.settingsOverlay = settingsOverlay;
  }

  openModel(search: string): void {
    const session = this.host.session();
    const models = session?.listModels?.() ?? [];
    if (!session || models.length === 0) return this.host.notify("No models available — run `pi` login first.");
    const { items, initialIndex } = modelSelectItems(models, session.modelId);
    this.open({ items, initialIndex, searchable: true, ...(search ? { initialSearch: search } : {}) }, async (key) => {
      const model = findModel(models, key);
      if (model) await session.setModel?.(model);
      this.host.notify(`Model: ${key}`);
    });
  }

  openThinking(): void {
    const session = this.host.session();
    const levels = session?.availableThinkingLevels?.() ?? [];
    if (!session || levels.length === 0) return this.host.notify("Thinking levels unavailable for this session.");
    const { items, initialIndex } = thinkingSelectItems(levels, session.thinkingLevel);
    this.open({ items, initialIndex }, async (level) => { session.setThinkingLevel?.(level); this.host.notify(`Thinking: ${level}`); });
  }

  async openSessions(): Promise<void> {
    const sessions = (await this.host.listSessions?.()) ?? [];
    if (sessions.length === 0) return this.host.notify("No sessions found for this directory.");
    const current = this.host.session()?.sessionPath;
    const { items, initialIndex } = sessionSelectItems(sessions, current, new Date());
    this.open({ items, initialIndex, searchable: true }, async (path) => {
      if (path === current) return this.host.notify("Already on that session.");
      await this.host.switchSession?.(path); this.host.notify("Resumed session");
    });
  }

  openTheme(): void {
    const original = this.host.settings().theme;
    const { items, initialIndex } = themeSelectItems(original);
    const overlay = this.open({ items, initialIndex }, async (theme) => {
      if (isThemeName(theme)) await this.host.setSetting("theme", theme);
      this.host.notify(`Theme: ${theme}`);
    });
    if (overlay) {
      overlay.onSelectionChange = (item) => { if (isThemeName(item.value)) this.host.applyTheme(item.value); };
      const cancel = overlay.onCancel;
      overlay.onCancel = () => { this.host.applyTheme(original); cancel?.(); };
    }
  }

  openSettings(): void {
    const tui = this.host.tui();
    const overlay = this.settingsOverlay(tui.ctx, { items: settingsItems(this.host.settings()), borderColor: border() });
    const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
    overlay.setWidth(width(tui)); overlay.onCancel = () => handle.hide();
    overlay.onChange = (id, value) => void applySettingChange(this.host, overlay, id, value).catch((error: unknown) => this.host.notify(`Error: ${error instanceof Error ? error.message : String(error)}`));
  }

  private open(options: SelectorOverlayOptions, apply: (value: string) => Promise<void>): SelectorOverlay | undefined {
    const tui = this.host.tui();
    const overlay = this.factory(tui.ctx, { ...options, borderColor: border() });
    overlay.setWidth(width(tui));
    const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
    overlay.onCancel = () => handle.hide();
    overlay.onSelect = (item) => { handle.hide(); void apply(item.value).then(() => this.host.refreshFooter()).catch((error: unknown) => this.host.notify(`Error: ${error instanceof Error ? error.message : String(error)}`)); };
    return overlay;
  }
}

const width = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100); const border = (): string => createTheme("dark").color("borderAccent");
