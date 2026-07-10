import { CombinedAutocompleteProvider, NodeFileSearchPort, type AutocompleteProvider, type SlashCommand } from "@pit/tui";
import { createBuiltinRegistry, type ChromeContext, type CommandInfo } from "../../domain/commands/index.ts";
import { AuthSelectors, type AuthSelectorHost } from "./auth-selectors.ts";
import { MiscSelectors, type MiscSelectorHost } from "./misc-selectors.ts";
import { ScopedModelsSelectors } from "./scoped-models-selector.ts";
import { ChromeSelectors, type SelectorHost } from "./selectors.ts";
import { openLabelInput, TreeSelectors } from "./tree-selector.ts";

export interface ChromeHost extends SelectorHost, AuthSelectorHost, MiscSelectorHost {
  exit(): void;
  reloadKeybindings(): void;
  setEnabledModels(patterns: string[] | undefined): Promise<void>;
  replay(): void;
  setEditorText?(text: string): void;
}

/** Bridges the pure command registry to the shell: autocomplete + submit dispatch. */
export class ShellChrome {
  private readonly registry = createBuiltinRegistry();
  private readonly context: ChromeContext;

  constructor(
    host: ChromeHost,
    selectors = new ChromeSelectors(host),
    authSelectors = new AuthSelectors(host),
    miscSelectors = new MiscSelectors(host),
    scopedSelectors = new ScopedModelsSelectors({
      tui: () => host.tui(), session: () => host.session(), notify: (text) => host.notify(text),
      settings: () => ({ setEnabledModels: (patterns) => host.setEnabledModels(patterns) }),
    }),
    treeSelectors = new TreeSelectors({
      tui: () => host.tui(), session: () => host.session(), notify: (text) => host.notify(text),
      replay: () => host.replay(), switchSession: (path) => host.switchSession?.(path) ?? Promise.resolve(),
      setEditorText: (text) => host.setEditorText?.(text),
      openInput: (prompt, onSubmit) => openLabelInput(host.tui(), prompt, onSubmit),
    }),
  ) {
    this.context = {
      notify: (text) => host.notify(text),
      exit: () => host.exit(),
      openModelSelector: (search) => selectors.openModel(search),
      openThinkingSelector: () => selectors.openThinking(),
      openSessionSelector: () => void selectors.openSessions(),
      openThemeSelector: () => selectors.openTheme(),
      openSettingsSelector: () => selectors.openSettings(),
      openLoginSelector: () => authSelectors.openLogin(),
      openHelpSelector: () => miscSelectors.openHelp(),
      openTrustSelector: () => miscSelectors.openTrust(),
      openScopedModels: () => scopedSelectors.openScopedModels(),
      openTree: () => treeSelectors.openTree(),
      forkSession: () => treeSelectors.forkSession(),
      reloadKeybindings: () => host.reloadKeybindings(),
    };
  }

  autocomplete(cwd: string): AutocompleteProvider {
    return new CombinedAutocompleteProvider(this.registry.list().map(toSlashCommand), cwd, new NodeFileSearchPort());
  }

  /** Returns true when the text was a slash command (handled or unknown) and must not reach the model. */
  async handle(text: string): Promise<boolean> {
    const result = await this.registry.dispatch(text, this.context);
    if (result.kind === "unknown") this.context.notify(`Unknown command: /${result.name} — type / to list commands`);
    return result.kind !== "not-command";
  }
}

const toSlashCommand = (command: CommandInfo): SlashCommand => ({ name: command.name, description: command.description });
