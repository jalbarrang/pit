import type { ExtensionUIContext, LoadExtensionsResult } from "@earendil-works/pi-coding-agent";
import {
  AuthStorage, createAgentSession, DefaultResourceLoader, getAgentDir,
  ModelRegistry, SessionManager, SettingsManager,
} from "@earendil-works/pi-coding-agent";
import type { ImagePart } from "../../domain/images/types.ts";
import type { SessionGateway } from "../../domain/ports.ts";
import { SessionFacade } from "./session-facade.ts";

export interface AppSessionOptions {
  cwd?: string;
  authPath?: string;
  extensionPaths?: string[];
  requireAuth?: boolean;
  sessionManager?: SessionManager;
}

export class AppSession implements SessionGateway {
  private readonly facade: SessionFacade;

  private constructor(facade: SessionFacade) { this.facade = facade; }

  static create(cwd = process.cwd(), authPath?: string): Promise<AppSession> {
    return AppSession.make({ cwd, authPath, sessionManager: SessionManager.create(cwd) });
  }

  static resume(path: string, cwd = process.cwd(), authPath?: string): Promise<AppSession> {
    return AppSession.make({ cwd, authPath, sessionManager: SessionManager.open(path) });
  }

  static createWithExtensions(options: AppSessionOptions): Promise<AppSession> {
    return AppSession.make(options);
  }

  private static async make(options: AppSessionOptions): Promise<AppSession> {
    const cwd = options.cwd ?? process.cwd();
    const authStorage = AuthStorage.create(options.authPath);
    const modelRegistry = ModelRegistry.create(authStorage);
    if (options.requireAuth !== false && modelRegistry.getAvailable().length === 0) {
      throw new Error("No pi model credentials found. Run `pi` and complete login first.");
    }
    const sessionManager = options.sessionManager ?? SessionManager.create(cwd);
    const resourceLoader = options.extensionPaths?.length
      ? await buildLoader(cwd, options.extensionPaths)
      : undefined;
    const { session, extensionsResult } = await createAgentSession({
      cwd, authStorage, modelRegistry, sessionManager, resourceLoader,
    });
    return new AppSession(new SessionFacade(session, modelRegistry, extensionsResult));
  }

  bindUI(ui: ExtensionUIContext): Promise<void> { return this.facade.bindUI(ui); }
  get extensionRunner() { return this.facade.extensionRunner; }
  get extensionsResult(): LoadExtensionsResult { return this.facade.extensionsResult; }
  get sessionPath() { return this.facade.sessionPath; }
  history() { return this.facade.history(); }
  listModels() { return this.facade.listModels(); }
  setModel(ref: Parameters<SessionFacade["setModel"]>[0]) { return this.facade.setModel(ref); }
  scopedModels() { return this.facade.scopedModels(); }
  setScopedModels(refs: Parameters<SessionFacade["setScopedModels"]>[0]) { this.facade.setScopedModels(refs); }
  cycleModel(direction: "forward" | "backward") { return this.facade.cycleModel(direction); }
  get thinkingLevel() { return this.facade.thinkingLevel; }
  availableThinkingLevels() { return this.facade.availableThinkingLevels(); }
  setThinkingLevel(level: string) { this.facade.setThinkingLevel(level); }
  subscribe(handler: Parameters<SessionFacade["subscribe"]>[0]) { return this.facade.subscribe(handler); }
  prompt(text: string, options?: { streamingBehavior?: "steer" | "followUp"; images?: ImagePart[] }) { return this.facade.prompt(text, options); }
  abort() { return this.facade.abort(); }
  steer(text: string) { return this.facade.steer(text); }
  queuedMessages() { return this.facade.queuedMessages(); }
  clearQueue() { return this.facade.clearQueue(); }
  dispose() { this.facade.dispose(); }
  get isStreaming() { return this.facade.isStreaming; }
  get modelId() { return this.facade.modelId; }
  get tokenUsage() { return this.facade.tokenUsage; }
  tree() { return this.facade.tree(); }
  leafId() { return this.facade.leafId(); }
  branchTo(id: string) { return this.facade.branchTo(id); }
  setLabel(id: string, label: string) { this.facade.setLabel(id, label); }
  forkSession() { return this.facade.forkSession(); }
}

async function buildLoader(cwd: string, extensionPaths: string[]) {
  const agentDir = getAgentDir();
  const settingsManager = SettingsManager.create(cwd, agentDir);
  const loader = new DefaultResourceLoader({
    cwd, agentDir, settingsManager, additionalExtensionPaths: extensionPaths,
    noSkills: true, noPromptTemplates: true, noThemes: true, noContextFiles: true,
  });
  await loader.reload();
  return loader;
}
