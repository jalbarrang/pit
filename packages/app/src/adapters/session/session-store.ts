import { SessionManager } from "@earendil-works/pi-coding-agent";
import type { SessionSummary } from "../../domain/ports.ts";
import { AppSession } from "./app-session.ts";

/** Lists persisted sessions for the cwd and resumes them as fresh gateways. */
export class SessionStore {
  private readonly cwd: string;

  constructor(cwd: string) {
    this.cwd = cwd;
  }

  async list(): Promise<SessionSummary[]> {
    const sessions = await SessionManager.list(this.cwd);
    return sessions.map((info) => ({
      path: info.path,
      id: info.id,
      ...(info.name ? { name: info.name } : {}),
      firstMessage: info.firstMessage,
      modified: info.modified,
      messageCount: info.messageCount,
    }));
  }

  resume(path: string): Promise<AppSession> {
    return AppSession.resume(path, this.cwd);
  }
}
