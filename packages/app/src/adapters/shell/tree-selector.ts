import type { RenderContext } from "@opentui/core";
import type { TUI } from "@pit/tui";
import { InputOverlay } from "../../components/chrome/input-overlay.ts";
import { TreeOverlay, type TreeOverlayOptions } from "../../components/chrome/tree-overlay.ts";
import type { SessionGateway } from "../../domain/index.ts";

export interface TreeSelectorHost {
  tui(): TUI;
  session(): SessionGateway | undefined;
  notify(text: string): void;
  replay(): void;
  switchSession(path: string): Promise<void>;
  openInput(prompt: string, onSubmit: (value: string) => void): void;
  setEditorText?(text: string): void;
}

type Factory = (ctx: RenderContext, options: TreeOverlayOptions) => TreeOverlay;
const factory: Factory = (ctx, options) => new TreeOverlay(ctx, options);
const width = (tui: TUI): number => Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);

/** Opens a one-line InputOverlay; used as the default openInput when wiring ChromeHost. */
export const openLabelInput = (tui: TUI, prompt: string, onSubmit: (value: string) => void): void => {
  const overlay = new InputOverlay(tui.ctx, prompt);
  const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
  overlay.setWidth(width(tui));
  overlay.onCancel = () => handle.hide();
  overlay.onSubmit = (value) => { handle.hide(); onSubmit(value); };
};

export class TreeSelectors {
  private readonly host: TreeSelectorHost;
  private readonly make: Factory;
  constructor(host: TreeSelectorHost, make = factory) { this.host = host; this.make = make; }

  openTree(): void {
    const s = this.host.session();
    if (!s?.tree) return this.host.notify("Session tree unavailable");
    const tui = this.host.tui();
    const overlay = this.make(tui.ctx, { nodes: s.tree(), leafId: s.leafId?.() });
    const handle = tui.showOverlay(overlay as never, { width: width(tui), anchor: "center" });
    overlay.setWidth(width(tui));
    overlay.onCancel = () => handle.hide();
    overlay.onSelect = (id) => {
      handle.hide();
      void Promise.resolve(s.branchTo?.(id)).then((editorText) => {
        this.host.replay();
        if (typeof editorText === "string" && editorText) this.host.setEditorText?.(editorText);
        this.host.notify("Branched");
      });
    };
    overlay.onEditLabel = (id) => this.host.openInput("Label", (value) => {
      s.setLabel?.(id, value);
      this.host.notify("Label saved");
    });
  }

  forkSession(): void {
    const path = this.host.session()?.forkSession?.();
    if (!path) return this.host.notify("Fork unavailable");
    void this.host.switchSession(path).then(() => this.host.notify("Forked session"));
  }
}
