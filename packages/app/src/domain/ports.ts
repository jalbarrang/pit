export interface ModelRef {
  provider: string;
  id: string;
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
}

export interface TokenUsage {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
  total: number;
}
