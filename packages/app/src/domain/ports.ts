export interface ModelRef {
  provider: string;
  id: string;
}

export interface SessionSummary {
  path: string;
  id: string;
  name?: string;
  firstMessage?: string;
  modified: Date;
  messageCount: number;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  text: string;
}

export interface SessionGateway<TEvent = unknown> {
  subscribe(handler: (event: TEvent) => void): () => void;
  prompt(text: string, options?: { streamingBehavior?: "steer" | "followUp" }): Promise<void>;
  abort(): Promise<void>;
  steer?(text: string): Promise<void>;
  dispose(): void;
  readonly isStreaming: boolean;
  readonly modelId: string;
  readonly tokenUsage: TokenUsage;
  listModels?(): ModelRef[];
  setModel?(ref: ModelRef): Promise<void>;
  readonly thinkingLevel?: string;
  availableThinkingLevels?(): string[];
  setThinkingLevel?(level: string): void;
  readonly sessionPath?: string;
  history?(): HistoryMessage[];
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
}
