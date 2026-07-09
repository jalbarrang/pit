import type { SettingsStore } from "../settings/index.ts";
import type { SessionGateway, SessionSummary } from "../../domain/index.ts";

export interface ChatShellOptions {
  cwd?: string;
  session?: SessionGateway;
  dummyLines?: string[];
  listSessions?(): Promise<SessionSummary[]>;
  switchSession?(path: string): Promise<void>;
  settingsStore?: SettingsStore;
}

export interface Expandable { setExpanded(expanded: boolean): void }
