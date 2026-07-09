export const shouldAbortStream = (data: string, hasSession: boolean): boolean => data === "\u001b" && hasSession;

export const promptOptionsForStreaming = (isStreaming: boolean): { streamingBehavior?: "steer" } | undefined =>
  isStreaming ? { streamingBehavior: "steer" } : undefined;
