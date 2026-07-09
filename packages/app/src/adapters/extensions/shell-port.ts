import type {
  ExtensionUIContext,
  ExtensionWidgetOptions,
  TerminalInputHandler,
  Theme,
  WorkingIndicatorOptions,
} from "@earendil-works/pi-coding-agent";
import type { Component, EditorComponent, TUI } from "@pit/tui";
import type {
  AutocompleteProviderFactory,
  EditorFactory,
  ExtensionShellPort,
  SetFooterFn,
  SetHeaderFn,
  SetWidgetFn,
} from "../../domain/extensions/ports.ts";
import { wrapExtensionComponent } from "./wrap-component.ts";

export interface ShellUiHost {
  tui(): TUI;
  getEditor(): EditorComponent;
  getToolsExpanded(): boolean;
  setToolsExpanded(expanded: boolean): void;
  theme: Theme;
}

export class ShellExtensionPort implements ExtensionShellPort {
  private statuses = new Map<string, string>();
  private editorFactory?: EditorFactory;
  private terminalHandlers: TerminalInputHandler[] = [];
  private widgets = new Map<string, Component>();
  theme: Theme;

  constructor(private readonly host: ShellUiHost) { this.theme = host.theme; }

  onTerminalInput(handler: TerminalInputHandler): () => void {
    this.terminalHandlers.push(handler);
    return () => { this.terminalHandlers = this.terminalHandlers.filter((h) => h !== handler); };
  }

  setStatus(key: string, text: string | undefined): void {
    if (text === undefined) this.statuses.delete(key); else this.statuses.set(key, text);
  }

  setWorkingMessage(_message?: string): void {}
  setWorkingVisible(_visible: boolean): void {}
  setWorkingIndicator(_options?: WorkingIndicatorOptions): void {}
  setHiddenThinkingLabel(_label?: string): void {}
  setTitle(title: string): void { process.title = title; }

  pasteToEditor(text: string): void { this.host.getEditor().handleInput?.(`\x1b[200~${text}\x1b[201~`); }
  setEditorText(text: string): void { this.host.getEditor().setText(text); }
  getEditorText(): string { return this.host.getEditor().getText(); }
  editor(_title: string, _prefill?: string): Promise<string | undefined> { return Promise.resolve(undefined); }

  addAutocompleteProvider(_factory: AutocompleteProviderFactory): void {}
  setEditorComponent(factory: EditorFactory | undefined): void { this.editorFactory = factory; }
  getEditorComponent(): EditorFactory | undefined { return this.editorFactory; }
  getToolsExpanded(): boolean { return this.host.getToolsExpanded(); }
  setToolsExpanded(expanded: boolean): void { this.host.setToolsExpanded(expanded); }

  setWidget: SetWidgetFn = (key, content) => {
    if (content === undefined) { this.widgets.delete(key); return; }
    if (typeof content === "function") return;
    const wrapped = wrapExtensionComponent(this.host.tui().ctx, content);
    if (wrapped) this.widgets.set(key, wrapped);
  };

  setFooter: SetFooterFn = () => {};
  setHeader: SetHeaderFn = () => {};
  custom: ExtensionUIContext["custom"] = () => Promise.reject(new Error("use PitExtensionUIContext.custom"));

  getAllThemes() { return [{ name: this.theme.name ?? "default", path: this.theme.sourcePath }]; }
  getTheme(name: string) { return name === (this.theme.name ?? "") ? this.theme : undefined; }
  setTheme(theme: string | Theme) {
    if (typeof theme !== "string") { this.theme = theme; return { success: true }; }
    if (theme === (this.theme.name ?? "")) return { success: true };
    return { success: false, error: `Theme switch deferred: ${theme}` };
  }
}
