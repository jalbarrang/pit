import type { ExtensionUIContext, Theme } from "@earendil-works/pi-coding-agent";
import type { TUI } from "@pit/tui";
import { overlayWidth } from "./overlay-dialogs.ts";
import { wrapExtensionComponent } from "./wrap-component.ts";

/** Run ExtensionUIContext.custom factory; duck-type result through AnsiBridge when needed. */
export function runCustomOverlay<T>(
  tui: TUI,
  theme: Theme,
  factory: Parameters<ExtensionUIContext["custom"]>[0],
  options?: Parameters<ExtensionUIContext["custom"]>[1],
): Promise<T> {
  return new Promise<T>(async (resolve, reject) => {
    try {
      let hide = () => {};
      const done = (result: T) => { hide(); resolve(result); };
      const raw = await (factory as (
        tui: never, theme: Theme, kb: never, done: (result: T) => void,
      ) => unknown)(tui as never, theme, {} as never, done);
      const wrapped = wrapExtensionComponent(tui.ctx, raw);
      if (!wrapped) { reject(new Error("custom factory returned unsupported component")); return; }
      const handle = tui.showOverlay(wrapped as never, { width: overlayWidth(tui), anchor: "center" });
      hide = () => handle.hide();
      options?.onHandle?.(handle as never);
    } catch (error) { reject(error); }
  });
}
