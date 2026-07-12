import { AuthStore } from "./adapters/auth/index.ts";
import { KeybindingsStore } from "./adapters/keybindings/index.ts";
import { ChatShell } from "./adapters/shell/index.ts";
import { SessionStore } from "./adapters/session/index.ts";
import { SettingsStore } from "./adapters/settings/index.ts";
import { TrustStore } from "./adapters/trust/index.ts";
import { ChatController } from "./application/index.ts";
import { replaySession } from "./application/replay.ts";
import type { SessionGateway } from "./domain/index.ts";

export interface RunChatAppOptions {
  cwd?: string;
  session?: SessionGateway<any>;
  dummyLines?: string[];
  store?: SessionStore;
  settingsStore?: SettingsStore;
  keybindingsStore?: KeybindingsStore;
  authStore?: AuthStore;
  firstRunSetup?: boolean;
  createSession?(): Promise<SessionGateway<any>>;
  trustStore?: TrustStore;
  trustPromptOnStart?: boolean;
  resumeOnStart?: boolean;
}

export const runChatApp = async (options: RunChatAppOptions = {}): Promise<ChatShell> => {
  const cwd = options.cwd ?? process.cwd();
  const store = options.store ?? new SessionStore(cwd);
  const keybindingsStore = options.keybindingsStore ?? new KeybindingsStore();
  const mgr = keybindingsStore.install();
  const createSession = options.createSession;
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
    authStore: options.authStore,
    trustStore: options.trustStore,
    trustPromptOnStart: options.trustPromptOnStart,
    firstRunSetup: options.firstRunSetup,
    reloadKeybindings: () => keybindingsStore.reload(mgr),
    onAuthConfigured: createSession ? async () => { const session = await createSession(); shell.replaceSession(session); attach(session); } : undefined,
    newSession: createSession ? async () => { const next = await createSession(); shell.replaceSession(next); attach(next); shell.chat.clear(); shell.showGreeting(); } : undefined,
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
