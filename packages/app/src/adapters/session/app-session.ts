import type { AgentSession, AgentSessionEvent } from "@earendil-works/pi-coding-agent";
import { AuthStorage, createAgentSession, ModelRegistry, SessionManager } from "@earendil-works/pi-coding-agent";
import type { ModelRef, SessionGateway, TokenUsage } from "../../domain/ports.ts";

export class AppSession implements SessionGateway<AgentSessionEvent> {
  private readonly session: AgentSession;
  private readonly modelRegistry: ModelRegistry;

  private constructor(session: AgentSession, modelRegistry: ModelRegistry) {
    this.session = session;
    this.modelRegistry = modelRegistry;
  }

  static async create(cwd = process.cwd()): Promise<AppSession> {
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    if (modelRegistry.getAvailable().length === 0) throw new Error("No pi model credentials found. Run `pi` and complete login first.");
    const sessionManager = SessionManager.create(cwd);
    const { session } = await createAgentSession({ cwd, authStorage, modelRegistry, sessionManager });
    return new AppSession(session, modelRegistry);
  }

  listModels(): ModelRef[] {
    return this.modelRegistry.getAvailable().map((model) => ({ provider: model.provider, id: model.id }));
  }

  async setModel(ref: ModelRef): Promise<void> {
    const model = this.modelRegistry.getAvailable().find((entry) => entry.provider === ref.provider && entry.id === ref.id);
    if (!model) throw new Error(`Model ${ref.provider}/${ref.id} is not available`);
    await this.session.setModel(model);
  }

  get thinkingLevel(): string {
    return this.session.thinkingLevel;
  }

  availableThinkingLevels(): string[] {
    return this.session.getAvailableThinkingLevels();
  }

  setThinkingLevel(level: string): void {
    this.session.setThinkingLevel(level as never);
  }

  subscribe(handler: (event: AgentSessionEvent) => void): () => void {
    return this.session.subscribe(handler);
  }

  prompt(text: string, options?: { streamingBehavior?: "steer" | "followUp" }): Promise<void> {
    return this.session.prompt(text, options);
  }

  abort(): Promise<void> {
    return this.session.abort();
  }

  steer(text: string): Promise<void> {
    return this.session.steer(text);
  }

  dispose(): void {
    this.session.dispose();
  }

  get isStreaming(): boolean {
    return this.session.isStreaming;
  }

  get modelId(): string {
    const model = this.session.model;
    return model ? `${model.provider}/${model.id}` : "no-model";
  }

  get tokenUsage(): TokenUsage {
    const tokens = this.session.getSessionStats().tokens;
    return { input: tokens.input, output: tokens.output, cacheRead: tokens.cacheRead, cacheWrite: tokens.cacheWrite, total: tokens.total };
  }
}
