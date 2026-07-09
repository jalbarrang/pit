import { ChatShell } from "./adapters/shell/index.ts";
import { ChatController } from "./application/index.ts";
import type { SessionGateway } from "./domain/index.ts";

export interface RunChatAppOptions {
  cwd?: string;
  session?: SessionGateway<any>;
  dummyLines?: string[];
}

export const runChatApp = async (options: RunChatAppOptions = {}): Promise<ChatShell> => {
  const shell = await ChatShell.create({ cwd: options.cwd, session: options.session, dummyLines: options.dummyLines });
  if (options.session) new ChatController(shell, options.session).start();
  return shell;
};
