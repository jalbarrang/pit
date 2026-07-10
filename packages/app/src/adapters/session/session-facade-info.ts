import type { AgentSession } from "@earendil-works/pi-coding-agent";
import type { TokenUsage } from "../../domain/ports.ts";

export function contextUsageOf(session: AgentSession): { percent: number; window: number } | undefined {
  const usage = session.getContextUsage();
  if (!usage || usage.percent == null) return undefined;
  return { percent: usage.percent, window: usage.contextWindow };
}

export function sessionStatsOf(session: AgentSession): {
  file?: string;
  id: string;
  userMessages: number;
  assistantMessages: number;
  toolCalls: number;
  totalMessages: number;
  totalTokens: number;
  cost?: number;
} {
  const stats = session.getSessionStats();
  return {
    file: stats.sessionFile,
    id: stats.sessionId,
    userMessages: stats.userMessages,
    assistantMessages: stats.assistantMessages,
    toolCalls: stats.toolCalls,
    totalMessages: stats.totalMessages,
    totalTokens: stats.tokens.total,
    cost: stats.cost,
  };
}

export function tokenUsageOf(session: AgentSession): TokenUsage {
  const tokens = session.getSessionStats().tokens;
  return { input: tokens.input, output: tokens.output, cacheRead: tokens.cacheRead, cacheWrite: tokens.cacheWrite, total: tokens.total };
}
