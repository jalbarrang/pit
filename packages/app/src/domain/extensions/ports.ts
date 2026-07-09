import type {
  ExtensionUIContext,
  ExtensionUIDialogOptions,
  ExtensionWidgetOptions,
  TerminalInputHandler,
  Theme,
  WorkingIndicatorOptions,
} from "@earendil-works/pi-coding-agent";

export type EditorFactory = Parameters<ExtensionUIContext["setEditorComponent"]>[0];
export type AutocompleteProviderFactory = Parameters<ExtensionUIContext["addAutocompleteProvider"]>[0];
export type CustomFn = ExtensionUIContext["custom"];
export type SetWidgetFn = ExtensionUIContext["setWidget"];
export type SetFooterFn = ExtensionUIContext["setFooter"];
export type SetHeaderFn = ExtensionUIContext["setHeader"];

/** Application-layer port for dialog/notify flows (testable with fakes). */
export interface ExtensionDialogPort {
  select(title: string, options: string[], opts?: ExtensionUIDialogOptions): Promise<string | undefined>;
  confirm(title: string, message: string, opts?: ExtensionUIDialogOptions): Promise<boolean>;
  input(title: string, placeholder?: string, opts?: ExtensionUIDialogOptions): Promise<string | undefined>;
  notify(message: string, type?: "info" | "warning" | "error"): void;
}

export interface ExtensionShellPort {
  onTerminalInput(handler: TerminalInputHandler): () => void;
  setStatus(key: string, text: string | undefined): void;
  setWorkingMessage(message?: string): void;
  setWorkingVisible(visible: boolean): void;
  setWorkingIndicator(options?: WorkingIndicatorOptions): void;
  setHiddenThinkingLabel(label?: string): void;
  setTitle(title: string): void;
  pasteToEditor(text: string): void;
  setEditorText(text: string): void;
  getEditorText(): string;
  editor(title: string, prefill?: string): Promise<string | undefined>;
  addAutocompleteProvider(factory: AutocompleteProviderFactory): void;
  setEditorComponent(factory: EditorFactory | undefined): void;
  getEditorComponent(): EditorFactory | undefined;
  getToolsExpanded(): boolean;
  setToolsExpanded(expanded: boolean): void;
  setWidget: SetWidgetFn;
  setFooter: SetFooterFn;
  setHeader: SetHeaderFn;
  custom: CustomFn;
  theme: Theme;
  getAllThemes(): { name: string; path: string | undefined }[];
  getTheme(name: string): Theme | undefined;
  setTheme(theme: string | Theme): { success: boolean; error?: string };
}
