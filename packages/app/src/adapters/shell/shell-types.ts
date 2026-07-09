import type { SessionGateway } from "../../domain/index.ts";

export interface ChatShellOptions { cwd?: string; session?: SessionGateway; dummyLines?: string[] }

export interface Expandable { setExpanded(expanded: boolean): void }
