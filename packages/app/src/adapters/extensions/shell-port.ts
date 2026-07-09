import type {
  ExtensionUIContext,
  ExtensionWidgetOptions,
  TerminalInputHandler,
  Theme,
  WorkingIndicatorOptions,
} from "@earendil-works/pi-coding-agent";
import type { Component, EditorComponent, TUI } from "@pit/tui";
import type { AutocompleteProviderFactory, EditorFactory, ExtensionShellPort, SetFooterFn, SetHeaderFn, SetWidgetFn } from "../../domain/extensions/ports.ts";
import { openEditorOverlay } from "./editor-overlay.ts";
import { wrapExtensionComponent } from "./wrap-component.ts";

type Disposable = Component & { dispose?(): void };

export interface ShellUiHost {
  tui(): TUI;
  getEditor(): EditorComponent;
  getToolsExpanded(): boolean;
  setToolsExpanded(expanded: boolean): void;
  mountHeader?(component: Component | undefined): void;
  mountFooter?(component: Component | undefined): void;
  mountWidget?(key: string, component: Component | undefined, placement?: "aboveEditor" | "belowEditor"): void;
  setWorkingMessage?(message?: string): void;
  setWorkingVisible?(visible: boolean): void;
  theme: Theme;
}

export class ShellExtensionPort implements ExtensionShellPort {
  private statuses = new Map<string, string>();
  private editorFactory?: EditorFactory;
  private terminalHandlers: TerminalInputHandler[] = [];
  private widgets = new Map<string, Disposable>();
  private header?: Disposable;
  private footer?: Disposable;
  theme: Theme;

  private readonly host: ShellUiHost;
  constructor(host: ShellUiHost) { this.host = host; this.theme = host.theme; }

  onTerminalInput(handler: TerminalInputHandler): () => void {
    this.terminalHandlers.push(handler);
    return () => { this.terminalHandlers = this.terminalHandlers.filter((h) => h !== handler); };
  }

  setStatus(key: string, text: string | undefined): void {
    if (text === undefined) this.statuses.delete(key); else this.statuses.set(key, text);
  }

  setWorkingMessage(message?: string): void { this.host.setWorkingMessage?.(message); }
  setWorkingVisible(visible: boolean): void { this.host.setWorkingVisible?.(visible); }
  setWorkingIndicator(_options?: WorkingIndicatorOptions): void {}
  setHiddenThinkingLabel(_label?: string): void {}
  setTitle(title: string): void { process.title = title; }

  pasteToEditor(text: string): void { this.host.getEditor().handleInput?.(`\x1b[200~${text}\x1b[201~`); }
  setEditorText(text: string): void { this.host.getEditor().setText(text); }
  getEditorText(): string { return this.host.getEditor().getText(); }
  editor(title: string, prefill?: string): Promise<string | undefined> { return openEditorOverlay(this.host.tui(), title, prefill); }

  addAutocompleteProvider(_factory: AutocompleteProviderFactory): void {}
  setEditorComponent(factory: EditorFactory | undefined): void { this.editorFactory = factory; }
  getEditorComponent(): EditorFactory | undefined { return this.editorFactory; }
  getToolsExpanded(): boolean { return this.host.getToolsExpanded(); }
  setToolsExpanded(expanded: boolean): void { this.host.setToolsExpanded(expanded); }

  setWidget: SetWidgetFn = (key, content, options) => { this.widgets.get(key)?.dispose?.();
    if (content === undefined) { this.widgets.delete(key); this.host.mountWidget?.(key, undefined); return; }
    const raw = typeof content === "function" ? content(this.host.tui() as never, this.theme) : content;
    const wrapped = wrapExtensionComponent(this.host.tui().ctx, raw) as Disposable | undefined;
    if (!wrapped) return; this.widgets.set(key, wrapped); this.host.mountWidget?.(key, wrapped, options?.placement);
  };

  setFooter: SetFooterFn = (factory) => { this.footer?.dispose?.();
    this.footer = factory?.(this.host.tui() as never, this.theme, { getStatus: (key: string) => this.statuses.get(key) } as never) as Disposable | undefined;
    this.host.mountFooter?.(this.footer); };
  setHeader: SetHeaderFn = (factory) => { this.header?.dispose?.(); this.header = factory?.(this.host.tui() as never, this.theme) as Disposable | undefined; this.host.mountHeader?.(this.header); };
  custom: ExtensionUIContext["custom"] = () => Promise.reject(new Error("use PitExtensionUIContext.custom"));

  getAllThemes() { return [{ name: this.theme.name ?? "default", path: this.theme.sourcePath }]; }
  getTheme(name: string) { return name === (this.theme.name ?? "") ? this.theme : undefined; }
  setTheme(theme: string | Theme) {
    if (typeof theme !== "string") { this.theme = theme; return { success: true }; }
    if (theme === (this.theme.name ?? "")) return { success: true };
    return { success: false, error: `Theme switch deferred: ${theme}` };
  }
}
