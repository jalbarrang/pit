import type { ExtensionUIDialogOptions } from "@earendil-works/pi-coding-agent";
import type { ExtensionDialogPort } from "./ports.ts";

/** Dialog use-cases — thin so adapters stay the only UI dependency. */
export const createDialogFlows = (port: ExtensionDialogPort) => ({
  select: (title: string, options: string[], opts?: ExtensionUIDialogOptions) =>
    port.select(title, options, opts),
  confirm: (title: string, message: string, opts?: ExtensionUIDialogOptions) =>
    port.confirm(title, message, opts),
  input: (title: string, placeholder?: string, opts?: ExtensionUIDialogOptions) =>
    port.input(title, placeholder, opts),
  notify: (message: string, type?: "info" | "warning" | "error") =>
    port.notify(message, type),
});

export type DialogFlows = ReturnType<typeof createDialogFlows>;
