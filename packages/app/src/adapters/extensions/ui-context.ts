import type {
  ExtensionUIContext,
  ExtensionUIDialogOptions,
  TerminalInputHandler,
  Theme,
  WorkingIndicatorOptions,
} from "@earendil-works/pi-coding-agent";
import { createDialogFlows } from "../../domain/extensions/index.ts";
import type {
  AutocompleteProviderFactory,
  EditorFactory,
  SetFooterFn,
  SetHeaderFn,
  SetWidgetFn,
} from "../../domain/extensions/ports.ts";
import { runCustomOverlay } from "./custom-overlay.ts";
import type { OverlayDialogPort } from "./overlay-dialogs.ts";
import type { ShellExtensionPort } from "./shell-port.ts";

/** ExtensionUIContext backed by pit overlays + shell port. */
export class PitExtensionUIContext implements ExtensionUIContext {
  private readonly dialogs: ReturnType<typeof createDialogFlows>;
  constructor(
    private readonly dialogPort: OverlayDialogPort,
    private readonly shell: ShellExtensionPort,
  ) {
    this.dialogs = createDialogFlows(dialogPort);
  }

  select(title: string, options: string[], opts?: ExtensionUIDialogOptions) {
    return this.dialogs.select(title, options, opts);
  }
  confirm(title: string, message: string, opts?: ExtensionUIDialogOptions) {
    return this.dialogs.confirm(title, message, opts);
  }
  input(title: string, placeholder?: string, opts?: ExtensionUIDialogOptions) {
    return this.dialogs.input(title, placeholder, opts);
  }
  notify(message: string, type?: "info" | "warning" | "error") { this.dialogs.notify(message, type); }

  onTerminalInput(handler: TerminalInputHandler) { return this.shell.onTerminalInput(handler); }
  setStatus(key: string, text: string | undefined) { this.shell.setStatus(key, text); }
  setWorkingMessage(message?: string) { this.shell.setWorkingMessage(message); }
  setWorkingVisible(visible: boolean) { this.shell.setWorkingVisible(visible); }
  setWorkingIndicator(options?: WorkingIndicatorOptions) { this.shell.setWorkingIndicator(options); }
  setHiddenThinkingLabel(label?: string) { this.shell.setHiddenThinkingLabel(label); }
  setTitle(title: string) { this.shell.setTitle(title); }

  setWidget: SetWidgetFn = ((key, content, options) => {
    this.shell.setWidget(key, content as never, options);
  }) as SetWidgetFn;
  setFooter: SetFooterFn = (...args) => this.shell.setFooter(...args);
  setHeader: SetHeaderFn = (...args) => this.shell.setHeader(...args);
  custom: ExtensionUIContext["custom"] = ((factory, options) =>
    runCustomOverlay(this.dialogPort.host.tui(), this.theme, factory, options)) as ExtensionUIContext["custom"];

  pasteToEditor(text: string) { this.shell.pasteToEditor(text); }
  setEditorText(text: string) { this.shell.setEditorText(text); }
  getEditorText() { return this.shell.getEditorText(); }
  editor(title: string, prefill?: string) { return this.dialogs.input(title, prefill); }
  addAutocompleteProvider(factory: AutocompleteProviderFactory) { this.shell.addAutocompleteProvider(factory); }
  setEditorComponent(factory: EditorFactory | undefined) { this.shell.setEditorComponent(factory); }
  getEditorComponent() { return this.shell.getEditorComponent(); }
  get theme() { return this.shell.theme; }
  getAllThemes() { return this.shell.getAllThemes(); }
  getTheme(name: string) { return this.shell.getTheme(name); }
  setTheme(theme: string | Theme) { return this.shell.setTheme(theme); }
  getToolsExpanded() { return this.shell.getToolsExpanded(); }
  setToolsExpanded(expanded: boolean) { this.shell.setToolsExpanded(expanded); }
}
