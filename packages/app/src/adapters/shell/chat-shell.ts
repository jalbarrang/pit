import { spawnSync } from "node:child_process"; import { readFileSync, unlinkSync, writeFileSync } from "node:fs"; import { tmpdir } from "node:os"; import { join } from "node:path";
import { BoxRenderable } from "@opentui/core";
import { Container, Editor, TUI, Text, getKeybindings, type Component, type EditorComponent } from "@pit/tui";
import { FooterComponent } from "../../components/footer.ts";
import { emptyTokens } from "../../components/footer-format.ts";
import { resolveEditorCommand } from "../../domain/keybindings/external-editor.ts"; import { nextModel } from "../../domain/keybindings/model-cycle.ts"; import { nextThinkingLevel } from "../../domain/keybindings/thinking-cycle.ts"; import { createTheme, getEditorTheme, type ThemeName } from "../../domain/theming/index.ts";
import type { ImagePart, OpenableImage, SessionGateway } from "../../domain/index.ts";
import { AuthStore } from "../auth/index.ts"; import { SettingsStore } from "../settings/index.ts"; import { TrustStore } from "../trust/index.ts";
import { bindShellExtensions } from "./bind-shell.ts"; import { ShellChrome } from "./chrome.ts";
import { DoubleCtrlCExit } from "./exit-keys.ts"; import { ExtensionMount } from "./extension-mount.ts";
import { createClipboardImageDeps, readClipboardImage } from "./clipboard-image.ts"; import { openInExternalEditor } from "./external-editor.ts"; import { FollowUpController } from "./follow-up.ts"; import { routeGlobalInput } from "./global-input.ts";
import { promptOptionsForStreaming, shouldAbortStream } from "./interrupt-keys.ts"; import { MacOpenImageViewer, type ImageViewer } from "./images/index.ts"; import { PendingImages } from "./pending-images.ts";
import { ScrollChat } from "./scroll-chat.ts"; import { bindSelectionCopy } from "./selection-copy.ts";
import type { ChatShellOptions, Expandable } from "./shell-types.ts";
import { suspendToBackground } from "./suspend.ts";
export type { ChatShellOptions } from "./shell-types.ts";
export class ChatShell {
  private readonly exitKeys = new DoubleCtrlCExit();
  private readonly chrome = new ShellChrome({ tui: () => this.tui, session: () => this.session, notify: (text) => this.notify(text), exit: () => this.exit(), refreshFooter: () => this.refreshFooter(), settings: () => this.settingsStore.get(), setSetting: (id, value) => this.settingsStore.set(id, value), applyTheme: (theme) => this.applyTheme(theme), auth: () => this.authStore, trust: () => this.trustStore, onAuthConfigured: () => this.hooks.onAuthConfigured?.() ?? Promise.resolve(), listSessions: () => this.hooks.listSessions?.() ?? Promise.resolve([]), switchSession: (path) => this.hooks.switchSession?.(path) ?? Promise.resolve(), reloadKeybindings: () => { this.hooks.reloadKeybindings?.(); this.notify("Keybindings reloaded"); } });
  private hooks: ChatShellOptions = {}; private readonly expandables: Expandable[] = []; private readonly thinkingBlocks: Expandable[] = []; private session?: SessionGateway;
  private cwd = process.cwd(); private toolsExpanded = false; private thinkingVisible = false; private settingsStore = new SettingsStore();
  private authStore?: AuthStore; private trustStore?: TrustStore; private imageViewer: ImageViewer = new MacOpenImageViewer(); private images: OpenableImage[] = []; private readonly pendingImages = new PendingImages();
  readonly tui: TUI; readonly chat: ScrollChat; readonly editor: EditorComponent; readonly footer: FooterComponent; readonly root: Container; readonly extensionMount: ExtensionMount;
  private readonly followUpCtl = new FollowUpController({ editorText: () => this.editor.getText(), setEditorText: (t) => this.editor.setText(t), isStreaming: () => !!this.session?.isStreaming, hasSession: () => this.session !== undefined, promptFollowUp: (t) => this.session?.prompt(t, { streamingBehavior: "followUp" }) ?? Promise.resolve(), submit: (t) => void this.submit(t), queued: () => this.session?.queuedMessages?.() ?? { steering: [], followUp: [] }, clearQueue: () => this.session?.clearQueue?.(), showPending: (lines) => this.showPendingWidget(lines) });
  private constructor(tui: TUI, chat: ScrollChat, editor: EditorComponent, footer: FooterComponent, root: Container) { this.tui = tui; this.chat = chat; this.editor = editor; this.footer = footer; this.root = root; this.extensionMount = new ExtensionMount(tui.ctx, footer, createTheme("dark")); }
  static async create(options: ChatShellOptions = {}): Promise<ChatShell> {
    const tui = await TUI.create();
    const settingsStore = options.settingsStore ?? new SettingsStore(options.cwd);
    const theme = createTheme(settingsStore.get().theme);
    const root = new Container(tui.ctx, new BoxRenderable(tui.ctx, { flexDirection: "column", width: "100%", height: "100%" }));
    const chat = new ScrollChat(tui.ctx);
    const editor = new Editor(tui.ctx, getEditorTheme(theme), { maxHeight: 10, width: tui.renderer.width });
    const footer = new FooterComponent(tui.ctx, theme);
    const shell = new ChatShell(tui, chat, editor, footer, root);
    shell.settingsStore = settingsStore; shell.authStore = options.authStore; shell.trustStore = options.trustStore; shell.mount(options);
    return shell;
  }
  private mount(options: ChatShellOptions): void {
    this.hooks = options; this.session = options.session; this.cwd = options.cwd ?? process.cwd(); this.imageViewer = options.imageViewer ?? this.imageViewer;
    this.root.addChild(this.extensionMount.headerSlot); this.root.addChild(this.chat);
    this.root.addChild(this.extensionMount.widgetAboveSlot); this.root.addChild(this.editor as never);
    this.root.addChild(this.extensionMount.widgetBelowSlot); this.root.addChild(this.extensionMount.footerSlot);
    this.chat.addDummyLines(this.tui.ctx, options.dummyLines ?? []); this.refreshFooter();
    this.editor.setAutocompleteProvider?.(this.chrome.autocomplete(this.cwd));
    this.editor.onSubmit = (text) => void this.submit(text);
    (this.editor.renderable as typeof this.editor.renderable & { onMouseDown?: () => void }).onMouseDown = () => this.tui.setFocus(this.editor as never);
    this.tui.addChild(this.root); this.tui.setFocus(this.editor as never); bindSelectionCopy(this.tui.renderer, this.footer);
    this.tui.addInputListener((data) => this.handleGlobalInput(data));
    if (options.trustPromptOnStart) void this.runCommand("/trust");
    if (options.firstRunSetup) void this.runCommand("/login");
    if (options.session) void bindShellExtensions(this, options.session, this.settingsStore);
  }
  private handleGlobalInput(data: string) {
    return routeGlobalInput({ hasOverlay: () => this.tui.hasOverlay(), editorText: () => this.editor.getText(), matches: getKeybindings(),
      openLastImage: () => void this.openLastImage(), page: (d) => this.chat.page(d), toggleTools: () => this.toggleTools(), exit: () => this.exit(),
      abortIfStreaming: (d) => { if (shouldAbortStream(d, this.session !== undefined)) { void this.session?.abort(); return true; } return false; },
      cycleModel: (dir) => this.cycleModel(dir), cycleThinking: () => this.cycleThinking(), toggleThinking: () => this.setThinkingVisible(!this.isThinkingVisible()), suspend: () => this.suspendApp(),
      externalEditor: () => this.openExternalEditor(), pasteImage: () => this.pasteImage(), followUp: () => this.followUpCtl.followUp(), dequeue: () => this.followUpCtl.dequeue(), openModelSelector: () => void this.runCommand("/model"), exitKeysInput: (d) => this.exitKeys.input(d) }, data);
  }
  private showPendingWidget(lines: string[]): void { this.mountWidget("pending-queue", lines.length ? new Text(this.tui.ctx, lines.join("\n"), 1, 0, { fg: createTheme(this.settingsStore.get().theme).color("muted") }) : undefined, "aboveEditor"); }
  private cycleModel(dir: 1 | -1): void {
    const s = this.session, models = s?.listModels?.() ?? [], i = s?.modelId.indexOf("/") ?? -1;
    const next = models.length >= 2 && s?.setModel ? nextModel(models, { provider: s.modelId.slice(0, i), id: s.modelId.slice(i + 1) }, dir) : null;
    if (!next || !s?.setModel) return this.notify("Model cycling unavailable");
    void s.setModel(next).then(() => { this.refreshFooter(); this.notify(`Model: ${next.provider}/${next.id}`); });
  }
  private cycleThinking(): void { const s = this.session, levels = s?.availableThinkingLevels?.() ?? []; if (!levels.length || !s?.setThinkingLevel) return this.notify("Thinking levels unavailable"); const next = nextThinkingLevel(levels, s.thinkingLevel ?? ""); s.setThinkingLevel(next); this.notify(`Thinking: ${next}`); }
  private suspendApp(): void { suspendToBackground({ platform: process.platform, renderer: this.tui.renderer, proc: process, notify: (m) => this.notify(m) }); }
  private openExternalEditor(): void {
    const tmp = join(tmpdir(), `pit-${Date.now()}.md`), r = this.tui.renderer;
    openInExternalEditor({ argv: resolveEditorCommand(process.env, process.platform), text: this.editor.getText(), tmpPath: tmp,
      writeFile: (p, d) => writeFileSync(p, d, "utf8"), readFile: (p) => readFileSync(p, "utf8"), removeFile: (p) => { try { unlinkSync(p); } catch { /* ignore */ } },
      spawn: (c, a) => { spawnSync(c, a, { stdio: "inherit" }); }, suspend: () => r.suspend(), resume: () => r.resume(), setText: (t) => this.editor.setText(t) });
  }
  private pasteImage(): void { const img = readClipboardImage(createClipboardImageDeps()); if (!img) return this.notify(process.platform === "darwin" ? "No image in clipboard" : "Paste image not supported on this platform"); this.pendingImages.push(img); this.rememberImages([img]); this.notify(`Image attached (${this.pendingImages.count})`); }
  private notify(text: string): void { this.chat.addMessage(new Text(this.tui.ctx, text, 1)); } notifyExtension(text: string): void { this.notify(text); } areToolsExpanded(): boolean { return this.toolsExpanded; } isThinkingVisible(): boolean { return this.thinkingVisible; }
  mountHeader(component: Component | undefined): void { this.extensionMount.mountHeader(component); }
  mountFooter(component: Component | undefined): void { this.extensionMount.mountFooter(component); }
  mountWidget(key: string, component: Component | undefined, placement?: "aboveEditor" | "belowEditor"): void { this.extensionMount.mountWidget(key, component, placement); }
  setWorkingMessage(message?: string): void { this.extensionMount.setWorkingMessage(message); } setWorkingVisible(visible: boolean): void { this.extensionMount.setWorkingVisible(visible); }
  rememberImages(images: ImagePart[]): void { this.images.push(...images.map((image, i) => ({ ...image, id: `image-${this.images.length + i + 1}` }))); }
  private async openLastImage(): Promise<void> { const image = this.images.at(-1); if (!image) { this.notify("No image available to open"); return; } const file = await this.imageViewer.open(image); this.notify(`Opened image: ${file}`); }
  setToolsExpanded(expanded: boolean): void { this.toolsExpanded = expanded; for (const c of this.expandables) c.setExpanded(expanded); }
  setThinkingVisible(visible: boolean): void { this.thinkingVisible = visible; for (const c of this.thinkingBlocks) c.setExpanded(visible); }
  private exit(): void { this.stop(); process.exit(0); }
  replaceSession(session: SessionGateway): void { this.session?.dispose(); this.session = session; this.refreshFooter(); void bindShellExtensions(this, session, this.settingsStore); }
  runCommand(text: string): Promise<boolean> { return this.chrome.handle(text); }
  refreshFooter(): void { this.footer.update(this.cwd, this.session?.modelId ?? "no-model", this.session?.tokenUsage ?? emptyTokens()); }
  applyTheme(themeName: ThemeName): void { const theme = createTheme(themeName); this.editor.borderColor = getEditorTheme(theme).borderColor; this.footer.applyTheme(theme); this.refreshFooter(); }
  registerExpandable(component: Expandable): void { component.setExpanded(this.toolsExpanded); this.expandables.push(component); }
  registerThinking(component: Expandable): void { component.setExpanded(this.thinkingVisible); this.thinkingBlocks.push(component); }
  private toggleTools(): void { this.setToolsExpanded(!this.toolsExpanded); }
  private async submit(text: string): Promise<void> { const trimmed = text.trim();
    if (!trimmed || await this.chrome.handle(trimmed)) return; if (!this.session) this.chat.addMessage(new Text(this.tui.ctx, `You: ${trimmed}`, 1));
    const imgs = this.pendingImages.takeAll(); await this.session?.prompt(trimmed, { ...promptOptionsForStreaming(!!this.session?.isStreaming), images: imgs }); }
  stop(): void { this.session?.dispose(); this.tui.stop(); }
}
