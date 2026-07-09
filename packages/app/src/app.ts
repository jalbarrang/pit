import { ChatShell } from "./adapters/shell/index.ts";
import type { SessionGateway } from "./domain/index.ts";

export interface RunChatAppOptions {
  cwd?: string;
  session?: SessionGateway;
  dummyLines?: string[];
}

export const runChatApp = async (options: RunChatAppOptions = {}): Promise<ChatShell> =>
  ChatShell.create({ cwd: options.cwd, session: options.session, dummyLines: options.dummyLines });
