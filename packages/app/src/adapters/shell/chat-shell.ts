import { BoxRenderable } from "@opentui/core";
import { Container, Editor, TUI, Text, getKeybindings, type Component, type EditorComponent } from "@pit/tui";
import { FooterComponent } from "../../components/footer.ts";
import { emptyTokens } from "../../components/footer-format.ts";
import { resolveGlobalAction } from "../../domain/keybindings/global-actions.ts"; import { createTheme, getEditorTheme, type ThemeName } from "../../domain/theming/index.ts";
import type { ImagePart, OpenableImage, SessionGateway } from "../../domain/index.ts";
import { AuthStore } from "../auth/index.ts"; import { SettingsStore } from "../settings/index.ts"; import { TrustStore } from "../trust/index.ts";
import { bindShellExtensions } from "./bind-shell.ts"; import { ShellChrome } from "./chrome.ts";
import { DoubleCtrlCExit } from "./exit-keys.ts"; import { ExtensionMount } from "./extension-mount.ts";
import { promptOptionsForStreaming, shouldAbortStream } from "./interrupt-keys.ts";
import { MacOpenImageViewer, type ImageViewer } from "./images/index.ts";
import { ScrollChat } from "./scroll-chat.ts"; import { bindSelectionCopy } from "./selection-copy.ts";
import type { ChatShellOptions, Expandable } from "./shell-types.ts";

export type { ChatShellOptions } from "./shell-types.ts";

export class ChatShell {
  private readonly exitKeys = new DoubleCtrlCExit();
  private readonly chrome = new ShellChrome({ tui: () => this.tui, session: () => this.session, notify: (text) => this.notify(text), exit: () => this.exit(), refreshFooter: () => this.refreshFooter(), settings: () => this.settingsStore.get(), setSetting: (id, value) => this.settingsStore.set(id, value), applyTheme: (theme) => this.applyTheme(theme), auth: () => this.authStore, trust: () => this.trustStore, onAuthConfigured: () => this.hooks.onAuthConfigured?.() ?? Promise.resolve(), listSessions: () => this.hooks.listSessions?.() ?? Promise.resolve([]), switchSession: (path) => this.hooks.switchSession?.(path) ?? Promise.resolve(), reloadKeybindings: () => { this.hooks.reloadKeybindings?.(); this.notify("Keybindings reloaded"); } });
  private hooks: ChatShellOptions = {};
  private readonly expandables: Expandable[] = [];
  private session?: SessionGateway;
  private cwd = process.cwd();
  private toolsExpanded = false;
  private settingsStore = new SettingsStore();
  private authStore?: AuthStore;
  private trustStore?: TrustStore;
  private imageViewer: ImageViewer = new MacOpenImageViewer();
  private images: OpenableImage[] = [];
  readonly tui: TUI; readonly chat: ScrollChat; readonly editor: EditorComponent; readonly footer: FooterComponent; readonly root: Container; readonly extensionMount: ExtensionMount;

  private constructor(tui: TUI, chat: ScrollChat, editor: EditorComponent, footer: FooterComponent, root: Container) {
    this.tui = tui; this.chat = chat; this.editor = editor; this.footer = footer; this.root = root;
    this.extensionMount = new ExtensionMount(tui.ctx, footer, createTheme("dark"));
  }

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
    if (this.tui.hasOverlay()) return undefined;
    if (data === "\u0019") { void this.openLastImage(); return { consume: true }; }
    const action = resolveGlobalAction(data, getKeybindings(), { editorEmpty: this.editor.getText().length === 0 });
    if (action === "page-up" || action === "page-down") { this.chat.page(action === "page-up" ? -10 : 10); return { consume: true }; }
    if (action === "tools-expand") { this.toggleTools(); return { consume: true }; }
    if (action === "exit-if-empty") { this.exit(); return { consume: true }; }
    if (action === "interrupt" && shouldAbortStream(data, this.session !== undefined)) { void this.session?.abort(); return { consume: true }; }
    const exit = this.exitKeys.input(data); if (exit === "exit") this.exit();
    return exit === "armed" ? { consume: true } : undefined;
  }

  private notify(text: string): void { this.chat.addMessage(new Text(this.tui.ctx, text, 1)); }
  notifyExtension(text: string): void { this.notify(text); }
  areToolsExpanded(): boolean { return this.toolsExpanded; }
  mountHeader(component: Component | undefined): void { this.extensionMount.mountHeader(component); }
  mountFooter(component: Component | undefined): void { this.extensionMount.mountFooter(component); }
  mountWidget(key: string, component: Component | undefined, placement?: "aboveEditor" | "belowEditor"): void { this.extensionMount.mountWidget(key, component, placement); }
  setWorkingMessage(message?: string): void { this.extensionMount.setWorkingMessage(message); }
  setWorkingVisible(visible: boolean): void { this.extensionMount.setWorkingVisible(visible); }
  rememberImages(images: ImagePart[]): void { this.images.push(...images.map((image, i) => ({ ...image, id: `image-${this.images.length + i + 1}` }))); }
  private async openLastImage(): Promise<void> { const image = this.images.at(-1); if (!image) { this.notify("No image available to open"); return; } const file = await this.imageViewer.open(image); this.notify(`Opened image: ${file}`); }
  setToolsExpanded(expanded: boolean): void { this.toolsExpanded = expanded; for (const c of this.expandables) c.setExpanded(expanded); }
  private exit(): void { this.stop(); process.exit(0); }
  replaceSession(session: SessionGateway): void { this.session?.dispose(); this.session = session; this.refreshFooter(); void bindShellExtensions(this, session, this.settingsStore); }
  runCommand(text: string): Promise<boolean> { return this.chrome.handle(text); }
  refreshFooter(): void { this.footer.update(this.cwd, this.session?.modelId ?? "no-model", this.session?.tokenUsage ?? emptyTokens()); }
  applyTheme(themeName: ThemeName): void { const theme = createTheme(themeName); this.editor.borderColor = getEditorTheme(theme).borderColor; this.footer.applyTheme(theme); this.refreshFooter(); }
  registerExpandable(component: Expandable): void { component.setExpanded(this.toolsExpanded); this.expandables.push(component); }
  private toggleTools(): void { this.setToolsExpanded(!this.toolsExpanded); }
  private async submit(text: string): Promise<void> { const trimmed = text.trim();
    if (!trimmed || await this.chrome.handle(trimmed)) return; if (!this.session) this.chat.addMessage(new Text(this.tui.ctx, `You: ${trimmed}`, 1));
    await this.session?.prompt(trimmed, promptOptionsForStreaming(!!this.session?.isStreaming)); }
  stop(): void { this.session?.dispose(); this.tui.stop(); }
}
