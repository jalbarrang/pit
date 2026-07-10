import type { AgentSession } from "@earendil-works/pi-coding-agent";

export async function compactOf(
  session: AgentSession,
  instructions?: string,
): Promise<{ summary: string; tokensBefore: number; tokensAfter?: number }> {
  const result = await session.compact(instructions);
  return {
    summary: result.summary,
    tokensBefore: result.tokensBefore,
    tokensAfter: result.estimatedTokensAfter,
  };
}

export function abortCompactionOf(session: AgentSession): void {
  session.abortCompaction();
}

export function isCompactingOf(session: AgentSession): boolean {
  return session.isCompacting;
}
