import type { RenderContext } from "@opentui/core";
import { getKeybindings } from "../domain/input/index.ts";
import { Loader, type LoaderIndicatorOptions } from "./loader.ts";
import type { PitStyle } from "./component-style.ts";

type LoaderArgs = ConstructorParameters<typeof Loader>;

export class CancellableLoader extends Loader {
  private abortController = new AbortController();
  onCancel?: () => void;
  onAbort?: () => void;

  constructor(
    ctx: RenderContext,
    spinnerStyle?: PitStyle,
    messageStyle?: PitStyle,
    message = "Loading...",
    indicator?: LoaderIndicatorOptions,
    renderable?: LoaderArgs[5],
    requestRender?: () => void,
  ) {
    super(ctx, spinnerStyle, messageStyle, message, indicator, renderable, requestRender);
  }

  get signal(): AbortSignal { return this.abortController.signal; }
  get aborted(): boolean { return this.signal.aborted; }

  handleInput(data: string): void {
    if (!getKeybindings().matches(data, "tui.select.cancel")) return;
    if (!this.aborted) this.abortController.abort();
    this.onCancel?.();
    this.onAbort?.();
  }

  dispose(): void {
    this.stop();
  }
}
