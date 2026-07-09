import type { SessionGateway } from "../../domain/index.ts";
import { bindSessionExtensions, isBindableSession } from "./bind-extensions.ts";
import type { ChatShell } from "./chat-shell.ts";
import type { SettingsStore } from "../settings/index.ts";

export async function bindShellExtensions(
  shell: ChatShell,
  session: SessionGateway,
  settings: SettingsStore,
): Promise<void> {
  if (!isBindableSession(session)) return;
  await bindSessionExtensions(shell, session, { name: settings.get().theme } as never);
}
