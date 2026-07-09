import type { ExtensionUIDialogOptions } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@pit/tui";
import { SelectorOverlay } from "../../components/chrome/selector-overlay.ts";
import { InputOverlay } from "../../components/chrome/input-overlay.ts";
import type { ExtensionDialogPort } from "../../domain/extensions/index.ts";

export interface OverlayDialogHost {
  tui(): TUI;
  notify(message: string, type?: "info" | "warning" | "error"): void;
}

export const overlayWidth = (tui: TUI): number =>
  Math.min(Math.max(40, (tui.renderer?.width ?? 80) - 8), 100);

export function withDialogAbort<T>(
  opts: ExtensionUIDialogOptions | undefined,
  run: (done: (v: T) => void) => () => void,
): Promise<T> {
  return new Promise((resolve) => {
    if (opts?.signal?.aborted) { resolve(undefined as T); return; }
    let hide = () => {};
    const finish = (value: T) => {
      opts?.signal?.removeEventListener("abort", onAbort);
      hide();
      resolve(value);
    };
    const onAbort = () => finish(undefined as T);
    opts?.signal?.addEventListener("abort", onAbort, { once: true });
    hide = run(finish);
    if (opts?.timeout) setTimeout(() => finish(undefined as T), opts.timeout);
  });
}

export class OverlayDialogPort implements ExtensionDialogPort {
  readonly host: OverlayDialogHost;
  constructor(host: OverlayDialogHost) { this.host = host; }

  select(title: string, options: string[], opts?: ExtensionUIDialogOptions): Promise<string | undefined> {
    return withDialogAbort(opts, (done) => {
      const tui = this.host.tui();
      const overlay = new SelectorOverlay(tui.ctx, {
        items: options.map((o) => ({ value: o, label: title ? `${o}` : o })),
      });
      const handle = tui.showOverlay(overlay as never, { width: overlayWidth(tui), anchor: "center" });
      overlay.setWidth(overlayWidth(tui));
      overlay.onCancel = () => done(undefined);
      overlay.onSelect = (item) => done(item.value);
      return () => handle.hide();
    });
  }

  confirm(title: string, message: string, opts?: ExtensionUIDialogOptions): Promise<boolean> {
    return this.select(`${title}: ${message}`, ["Yes", "No"], opts).then((v) => v === "Yes");
  }

  input(title: string, _placeholder?: string, opts?: ExtensionUIDialogOptions): Promise<string | undefined> {
    return withDialogAbort(opts, (done) => {
      const tui = this.host.tui();
      const overlay = new InputOverlay(tui.ctx, title);
      const handle = tui.showOverlay(overlay as never, { width: overlayWidth(tui), anchor: "center" });
      overlay.setWidth(overlayWidth(tui));
      overlay.onCancel = () => done(undefined);
      overlay.onSubmit = (value) => done(value);
      return () => handle.hide();
    });
  }

  notify(message: string, type?: "info" | "warning" | "error"): void {
    this.host.notify(message, type);
  }
}
