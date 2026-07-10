import type { AgentSession, AgentSessionEvent, ExtensionUIContext, LoadExtensionsResult, ModelRegistry } from "@earendil-works/pi-coding-agent";
import { SessionManager } from "@earendil-works/pi-coding-agent";
import { textFromContent } from "../../domain/conversation/event-text.ts";
import { toImageContent } from "../../domain/images/to-image-content.ts";
import type { ImagePart } from "../../domain/images/types.ts";
import type { HistoryMessage, ModelRef, TokenUsage } from "../../domain/ports.ts";
import type { TreeNode } from "../../domain/tree/types.ts";
import { mapTree } from "./tree-mapper.ts";

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
  private get manager() { return this.session.sessionManager; }

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

  scopedModels(): ModelRef[] {
    return this.session.scopedModels.map((e) => ({ provider: e.model.provider, id: e.model.id }));
  }

  setScopedModels(refs: ModelRef[] | null): void {
    if (refs === null) { this.session.setScopedModels([]); return; }
    const available = this.modelRegistry.getAvailable();
    this.session.setScopedModels(refs.flatMap((ref) => {
      const model = available.find((m) => m.provider === ref.provider && m.id === ref.id);
      return model ? [{ model }] : [];
    }));
  }

  async cycleModel(direction: "forward" | "backward"): Promise<string | undefined> {
    const result = await this.session.cycleModel(direction);
    return result ? `${result.model.provider}/${result.model.id}` : undefined;
  }

  get thinkingLevel(): string { return this.session.thinkingLevel; }
  availableThinkingLevels(): string[] { return this.session.getAvailableThinkingLevels(); }
  setThinkingLevel(level: string): void { this.session.setThinkingLevel(level as never); }
  subscribe(handler: (event: AgentSessionEvent) => void): () => void { return this.session.subscribe(handler); }
  prompt(text: string, options?: { streamingBehavior?: "steer" | "followUp"; images?: ImagePart[] }): Promise<void> {
    if (!options?.images) return this.session.prompt(text, options as never);
    const { images, ...rest } = options;
    return this.session.prompt(text, { ...rest, images: images.map(toImageContent) });
  }
  abort(): Promise<void> { return this.session.abort(); }
  steer(text: string): Promise<void> { return this.session.steer(text); }
  queuedMessages(): { steering: string[]; followUp: string[] } {
    return { steering: [...this.session.getSteeringMessages()], followUp: [...this.session.getFollowUpMessages()] };
  }
  clearQueue(): { steering: string[]; followUp: string[] } { return this.session.clearQueue(); }
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

  tree(): TreeNode[] { return mapTree(this.manager.getTree() as unknown[]); }
  leafId(): string | undefined { return this.manager.getLeafId() ?? undefined; }
  async branchTo(id: string): Promise<string | undefined> { return (await this.session.navigateTree(id)).editorText; }
  setLabel(id: string, label: string): void { this.manager.appendLabelChange(id, label); }
  forkSession(): string | undefined {
    const p = this.manager.getSessionFile();
    return p ? SessionManager.forkFrom(p, this.manager.getCwd()).getSessionFile() : undefined;
  }
}
