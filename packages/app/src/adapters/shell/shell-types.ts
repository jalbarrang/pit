import type { SessionGateway, SessionSummary } from "../../domain/index.ts";

export interface ChatShellOptions {
  cwd?: string;
  session?: SessionGateway;
  dummyLines?: string[];
  listSessions?(): Promise<SessionSummary[]>;
  switchSession?(path: string): Promise<void>;
}

export interface Expandable { setExpanded(expanded: boolean): void }
