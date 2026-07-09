import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { SelectorOverlay, type SelectorOverlayOptions } from "../../components/chrome/selector-overlay.ts";
import { findTrustChoice, keybindingHelpItems, trustItems } from "../../domain/chrome/index.ts";
import type { TrustStore } from "../trust/index.ts";

export interface MiscSelectorHost {
  tui(): TUI;
  trust(): TrustStore | undefined;
  notify(text: string): void;
}

type Factory = (ctx: RenderContext, options: SelectorOverlayOptions) => SelectorOverlay;
const factory: Factory = (ctx, options) => new SelectorOverlay(ctx, options);

export class MiscSelectors {
  private readonly host: MiscSelectorHost;
  private readonly make: Factory;
  constructor(host: MiscSelectorHost, make = factory) { this.host = host; this.make = make; }

  openHelp(): void {
    this.open({ items: keybindingHelpItems() }, () => this.host.notify("Help is informational; press Esc to close."));
  }

  openTrust(): void {
    const trust = this.host.trust();
    if (!trust) return this.host.notify("Project trust storage unavailable.");
    this.open({ items: trustItems() }, (value) => {
      const choice = findTrustChoice(value);
      if (!choice) return;
      trust.setTrusted(choice.trusted);
      this.host.notify(`Project ${choice.trusted ? "trusted" : "not trusted"}`);
    });
  }

  private open(options: SelectorOverlayOptions, select: (value: string) => void): void {
    const tui = this.host.tui();
    const overlay = this.make(tui.ctx, options);
    const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
    overlay.setWidth(width(tui));
    overlay.onCancel = () => handle.hide();
    overlay.onSelect = (item) => { handle.hide(); select(item.value); };
  }
}

const width = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);
