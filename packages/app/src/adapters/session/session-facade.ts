import type { AgentSession, AgentSessionEvent, ExtensionUIContext, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { textFromContent } from "../../domain/conversation/event-text.ts";
import type { HistoryMessage, ModelRef, TokenUsage } from "../../domain/ports.ts";

/** SessionGateway methods delegated onto the SDK AgentSession. */
export class SessionFacade {
  readonly session: AgentSession;
  readonly extensionsResult: LoadExtensionsResult;
  private readonly modelRegistry: ModelRegistry;

  constructor(session: AgentSession, modelRegistry: ModelRegistry, extensionsResult: LoadExtensionsResult) {
    this.session = session;
    this.modelRegistry = modelRegistry;
    this.extensionsResult = extensionsResult;
  }

  async bindUI(uiContext: ExtensionUIContext): Promise<void> {
    await this.session.bindExtensions({ uiContext, mode: "tui" });
  }

  get extensionRunner() { return this.session.extensionRunner; }
  get sessionPath(): string | undefined { return this.session.sessionManager.getSessionFile(); }

  history(): HistoryMessage[] {
    return this.session.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role as "user" | "assistant", text: textFromContent(m.content as never) }))
      .filter((m) => m.text.trim().length > 0);
  }

  listModels(): ModelRef[] {
    return this.modelRegistry.getAvailable().map((m) => ({ provider: m.provider, id: m.id }));
  }

  async setModel(ref: ModelRef): Promise<void> {
    const model = this.modelRegistry.getAvailable().find((e) => e.provider === ref.provider && e.id === ref.id);
    if (!model) throw new Error(`Model ${ref.provider}/${ref.id} is not available`);
    await this.session.setModel(model);
  }

  get thinkingLevel(): string { return this.session.thinkingLevel; }
  availableThinkingLevels(): string[] { return this.session.getAvailableThinkingLevels(); }
  setThinkingLevel(level: string): void { this.session.setThinkingLevel(level as never); }
  subscribe(handler: (event: AgentSessionEvent) => void): () => void { return this.session.subscribe(handler); }
  prompt(text: string, options?: { streamingBehavior?: "steer" | "followUp" }): Promise<void> {
    return this.session.prompt(text, options);
  }
  abort(): Promise<void> { return this.session.abort(); }
  steer(text: string): Promise<void> { return this.session.steer(text); }
  dispose(): void { this.session.dispose(); }
  get isStreaming(): boolean { return this.session.isStreaming; }
  get modelId(): string {
    const model = this.session.model;
    return model ? `${model.provider}/${model.id}` : "no-model";
  }
  get tokenUsage(): TokenUsage {
    const tokens = this.session.getSessionStats().tokens;
    return { input: tokens.input, output: tokens.output, cacheRead: tokens.cacheRead, cacheWrite: tokens.cacheWrite, total: tokens.total };
  }
}
