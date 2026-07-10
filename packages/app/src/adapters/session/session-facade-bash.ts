import type { AgentSession } from "@earendil-works/pi-coding-agent";

export async function executeBashOf(
  session: AgentSession,
  command: string,
  onChunk: (chunk: string) => void,
  options: { excludeFromContext: boolean },
): Promise<{ exitCode?: number | null; cancelled: boolean }> {
  const result = await session.executeBash(command, onChunk, {
    excludeFromContext: options.excludeFromContext,
  });
  return { exitCode: result.exitCode, cancelled: result.cancelled };
}

export function abortBashOf(session: AgentSession): void {
  session.abortBash();
}

export function isBashRunningOf(session: AgentSession): boolean {
  return session.isBashRunning;
}
