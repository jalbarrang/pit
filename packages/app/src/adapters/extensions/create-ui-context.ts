import type { Theme } from "@earendil-works/pi-coding-agent";
import type { Component, EditorComponent, TUI } from "@pit/tui";
import { OverlayDialogPort, PitExtensionUIContext, ShellExtensionPort } from "../extensions/index.ts";

export interface BindHost {
  tui(): TUI;
  notify(message: string, type?: "info" | "warning" | "error"): void;
  getEditor(): EditorComponent;
  getToolsExpanded(): boolean;
  setToolsExpanded(expanded: boolean): void;
  mountHeader?(component: Component | undefined): void;
  mountFooter?(component: Component | undefined): void;
  mountWidget?(key: string, component: Component | undefined, placement?: "aboveEditor" | "belowEditor"): void;
  setWorkingMessage?(message?: string): void;
  setWorkingVisible?(visible: boolean): void;
  theme: Theme;
}

/** Build PitExtensionUIContext from a shell host. */
export function createPitUIContext(host: BindHost): PitExtensionUIContext {
  const dialogs = new OverlayDialogPort(host);
  const shell = new ShellExtensionPort(host);
  return new PitExtensionUIContext(dialogs, shell);
}
