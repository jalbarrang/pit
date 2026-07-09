import type { AuthStore } from "../auth/index.ts";
import type { SettingsStore } from "../settings/index.ts";
import type { TrustStore } from "../trust/index.ts";
import type { SessionGateway, SessionSummary } from "../../domain/index.ts";

export interface ChatShellOptions {
  cwd?: string;
  session?: SessionGateway;
  dummyLines?: string[];
  listSessions?(): Promise<SessionSummary[]>;
  switchSession?(path: string): Promise<void>;
  settingsStore?: SettingsStore;
  authStore?: AuthStore;
  onAuthConfigured?(): Promise<void>;
  firstRunSetup?: boolean;
  trustStore?: TrustStore;
  trustPromptOnStart?: boolean;
}

export interface Expandable { setExpanded(expanded: boolean): void }
