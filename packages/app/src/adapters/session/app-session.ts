import type { AgentSession, AgentSessionEvent } from "@earendil-works/pi-coding-agent";
import { AuthStorage, createAgentSession, ModelRegistry, SessionManager } from "@earendil-works/pi-coding-agent";
import type { SessionGateway, TokenUsage } from "../../domain/ports.ts";

export class AppSession implements SessionGateway<AgentSessionEvent> {
  private readonly session: AgentSession;

  private constructor(session: AgentSession) {
    this.session = session;
  }

  static async create(cwd = process.cwd()): Promise<AppSession> {
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);
    if (modelRegistry.getAvailable().length === 0) throw new Error("No pi model credentials found. Run `pi` and complete login first.");
    const sessionManager = SessionManager.create(cwd);
    const { session } = await createAgentSession({ cwd, authStorage, modelRegistry, sessionManager });
    return new AppSession(session);
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
