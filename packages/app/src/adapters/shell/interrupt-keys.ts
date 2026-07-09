import { matchesKey } from "@pit/tui";

export const shouldAbortStream = (data: string, hasSession: boolean): boolean => hasSession && matchesKey(data, "escape");

export const promptOptionsForStreaming = (isStreaming: boolean): { streamingBehavior?: "steer" } | undefined =>
  isStreaming ? { streamingBehavior: "steer" } : undefined;
