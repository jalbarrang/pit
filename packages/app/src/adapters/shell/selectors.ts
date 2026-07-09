import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { SelectorOverlay, type SelectorOverlayOptions } from "../../components/chrome/selector-overlay.ts";
import { findModel, modelSelectItems, thinkingSelectItems } from "../../domain/chrome/index.ts";
import { createTheme } from "../../domain/theming/index.ts";
import type { SessionGateway } from "../../domain/index.ts";

export interface SelectorHost {
  tui(): TUI;
  session(): SessionGateway | undefined;
  notify(text: string): void;
  refreshFooter(): void;
}

type OverlayFactory = (ctx: RenderContext, options: SelectorOverlayOptions) => SelectorOverlay;
const defaultFactory: OverlayFactory = (ctx, options) => new SelectorOverlay(ctx, options);

export class ChromeSelectors {
  private readonly host: SelectorHost;
  private readonly factory: OverlayFactory;

  constructor(host: SelectorHost, factory: OverlayFactory = defaultFactory) {
    this.host = host;
    this.factory = factory;
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
    this.open({ items, initialIndex }, async (level) => {
      session.setThinkingLevel?.(level);
      this.host.notify(`Thinking: ${level}`);
    });
  }

  private open(options: SelectorOverlayOptions, apply: (value: string) => Promise<void>): void {
    const tui = this.host.tui();
    const width = Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);
    const overlay = this.factory(tui.ctx, { ...options, borderColor: createTheme("dark").color("borderAccent") as never });
    overlay.setWidth(width);
    const handle = tui.showOverlay(overlay as never, { width, anchor: "center" });
    overlay.onCancel = () => handle.hide();
    overlay.onSelect = (item) => {
      handle.hide();
      void apply(item.value)
        .then(() => this.host.refreshFooter())
        .catch((error: unknown) => this.host.notify(`Error: ${error instanceof Error ? error.message : String(error)}`));
    };
  }
}
