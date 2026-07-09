import { BoxRenderable } from "@opentui/core";
import { Container, Editor, TUI, Text, type EditorComponent } from "@pit/tui";
import { FooterComponent } from "../../components/footer.ts";
import { emptyTokens } from "../../components/footer-format.ts";
import { createTheme, getEditorTheme } from "../../domain/theming/index.ts";
import type { SessionGateway } from "../../domain/index.ts";
import { emptyAutocompleteProvider } from "./empty-autocomplete.ts";
import { DoubleCtrlCExit } from "./exit-keys.ts";
import { promptOptionsForStreaming, shouldAbortStream } from "./interrupt-keys.ts";
import { ScrollChat } from "./scroll-chat.ts";

export interface ChatShellOptions { cwd?: string; session?: SessionGateway; dummyLines?: string[] }

interface Expandable { setExpanded(expanded: boolean): void }

export class ChatShell {
  private readonly exitKeys = new DoubleCtrlCExit();
  private readonly expandables: Expandable[] = [];
  private session?: SessionGateway;
  private cwd = process.cwd();
  private toolsExpanded = false;
  readonly root: Container;
  readonly tui: TUI;
  readonly chat: ScrollChat;
  readonly editor: EditorComponent;
  readonly footer: FooterComponent;

  private constructor(tui: TUI, chat: ScrollChat, editor: EditorComponent, footer: FooterComponent, root: Container) {
    this.tui = tui;
    this.chat = chat;
    this.editor = editor;
    this.footer = footer;
    this.root = root;
  }

  static async create(options: ChatShellOptions = {}): Promise<ChatShell> {
    const tui = await TUI.create();
    const theme = createTheme("dark");
    const root = new Container(tui.ctx, new BoxRenderable(tui.ctx, { flexDirection: "column", width: "100%", height: "100%" }));
    const chat = new ScrollChat(tui.ctx);
    const editor = new Editor(tui.ctx, getEditorTheme(theme), { maxHeight: 10, width: tui.renderer.width });
    const footer = new FooterComponent(tui.ctx, theme);
    const shell = new ChatShell(tui, chat, editor, footer, root);
    shell.mount(options);
    return shell;
  }

  private mount(options: ChatShellOptions): void {
    this.session = options.session;
    this.cwd = options.cwd ?? process.cwd();
    this.root.addChild(this.chat);
    this.root.addChild(this.editor as never);
    this.root.addChild(this.footer);
    this.chat.addDummyLines(this.tui.ctx, options.dummyLines ?? []);
    this.refreshFooter();
    this.editor.setAutocompleteProvider?.(emptyAutocompleteProvider);
    this.editor.onSubmit = (text) => void this.submit(text, options.session);
    this.tui.addChild(this.root);
    this.tui.setFocus(this.editor as never);
    this.tui.addInputListener((data) => this.handleGlobalInput(data));
  }

  private handleGlobalInput(data: string) {
    if (data === "\u001b[5~") { this.chat.page(-10); return { consume: true }; }
    if (data === "\u001b[6~") { this.chat.page(10); return { consume: true }; }
    if (data === "\u000f") { this.toggleTools(); return { consume: true }; }
    if (shouldAbortStream(data, this.session !== undefined)) { void this.session?.abort(); return { consume: true }; }
    const exit = this.exitKeys.input(data);
    if (exit === "exit") { this.stop(); process.exitCode = 0; return { consume: true }; }
    return exit === "armed" ? { consume: true } : undefined;
  }

  refreshFooter(): void {
    this.footer.update(this.cwd, this.session?.modelId ?? "no-model", this.session?.tokenUsage ?? emptyTokens());
  }

  registerExpandable(component: Expandable): void {
    component.setExpanded(this.toolsExpanded);
    this.expandables.push(component);
  }

  private toggleTools(): void {
    this.toolsExpanded = !this.toolsExpanded;
    for (const component of this.expandables) component.setExpanded(this.toolsExpanded);
  }

  private async submit(text: string, session?: SessionGateway): Promise<void> {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!session) this.chat.addMessage(new Text(this.tui.ctx, `You: ${trimmed}`, 1));
    await session?.prompt(trimmed, promptOptionsForStreaming(!!session?.isStreaming));
  }

  stop(): void {
    this.tui.stop();
  }
}
