import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { ScopedModelsOverlay, type ScopedModelsOverlayOptions } from "../../components/chrome/scoped-models-overlay.ts";
import type { SessionGateway } from "../../domain/index.ts";

export interface ScopedModelsSelectorHost {
  tui(): TUI;
  session(): SessionGateway | undefined;
  settings(): { setEnabledModels(patterns: string[] | undefined): Promise<void> };
  notify(text: string): void;
}

type Factory = (ctx: RenderContext, options: ScopedModelsOverlayOptions) => ScopedModelsOverlay;
const factory: Factory = (ctx, options) => new ScopedModelsOverlay(ctx, options);

const toId = (ref: { provider: string; id: string }): string => `${ref.provider}/${ref.id}`;
const toRef = (id: string): { provider: string; id: string } => {
  const i = id.indexOf("/");
  return { provider: id.slice(0, i), id: id.slice(i + 1) };
};

export class ScopedModelsSelectors {
  private readonly host: ScopedModelsSelectorHost;
  private readonly make: Factory;
  constructor(host: ScopedModelsSelectorHost, make = factory) { this.host = host; this.make = make; }

  openScopedModels(): void {
    const s = this.host.session();
    if (!s?.listModels) return this.host.notify("Models unavailable");
    const items = s.listModels().map((m) => ({ id: toId(m), label: toId(m), provider: m.provider }));
    const scoped = s.scopedModels?.() ?? [];
    const initial = scoped.length === 0 ? null : scoped.map(toId);
    const tui = this.host.tui();
    const overlay = this.make(tui.ctx, { items, initial });
    const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
    overlay.setWidth(width(tui));
    overlay.onCancel = () => handle.hide();
    overlay.onChange = (enabled) => s.setScopedModels?.(enabled === null ? null : enabled.map(toRef));
    overlay.onPersist = (enabled) => void this.host.settings().setEnabledModels(enabled ?? undefined).then(() => this.host.notify("Model scope saved"));
  }
}

const width = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);
