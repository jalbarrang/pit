import { ChatShell } from "./adapters/shell/index.ts";
import { SessionStore } from "./adapters/session/index.ts";
import { SettingsStore } from "./adapters/settings/index.ts";
import { ChatController } from "./application/index.ts";
import { replaySession } from "./application/replay.ts";
import type { SessionGateway } from "./domain/index.ts";

export interface RunChatAppOptions {
  cwd?: string;
  session?: SessionGateway<any>;
  dummyLines?: string[];
  store?: SessionStore;
  settingsStore?: SettingsStore;
  resumeOnStart?: boolean;
}

export const runChatApp = async (options: RunChatAppOptions = {}): Promise<ChatShell> => {
  const cwd = options.cwd ?? process.cwd();
  const store = options.store ?? new SessionStore(cwd);
  let controller: ChatController | undefined;
  const attach = (session: SessionGateway<any>): void => {
    controller?.stop();
    controller = new ChatController(shell, session);
    controller.start();
  };
  const shell: ChatShell = await ChatShell.create({
    cwd,
    session: options.session,
    dummyLines: options.dummyLines,
    listSessions: () => store.list(),
    settingsStore: options.settingsStore,
    switchSession: async (path) => {
      const next = await store.resume(path);
      shell.replaceSession(next);
      replaySession(shell, next);
      attach(next);
    },
  });
  if (options.session) attach(options.session);
  if (options.resumeOnStart) void shell.runCommand("/resume");
  return shell;
};
