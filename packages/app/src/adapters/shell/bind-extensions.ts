import type { Theme } from "@earendil-works/pi-coding-agent";
import type { SessionGateway } from "../../domain/ports.ts";
import { createPitUIContext } from "../extensions/create-ui-context.ts";
import type { ChatShell } from "./chat-shell.ts";

export interface BindableSession extends SessionGateway {
  bindUI(ui: import("@earendil-works/pi-coding-agent").ExtensionUIContext): Promise<void>;
}

export const isBindableSession = (session: SessionGateway | undefined): session is BindableSession =>
  !!session && typeof (session as BindableSession).bindUI === "function";

/** Bind PitExtensionUIContext onto an AppSession (or any bindUI-capable gateway). */
export async function bindSessionExtensions(shell: ChatShell, session: BindableSession, theme: Theme): Promise<void> {
  const ui = createPitUIContext({
    tui: () => shell.tui,
    notify: (message) => shell.notifyExtension(message),
    getEditor: () => shell.editor,
    getToolsExpanded: () => shell.areToolsExpanded(),
    setToolsExpanded: (expanded) => shell.setToolsExpanded(expanded),
    theme,
  });
  await session.bindUI(ui);
}
