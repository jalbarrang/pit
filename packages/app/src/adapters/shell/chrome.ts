import { CombinedAutocompleteProvider, NodeFileSearchPort, type AutocompleteProvider, type SlashCommand } from "@pit/tui";
import { createBuiltinRegistry, type ChromeContext, type CommandInfo } from "../../domain/commands/index.ts";
import { ChromeSelectors, type SelectorHost } from "./selectors.ts";

export interface ChromeHost extends SelectorHost {
  exit(): void;
}

/** Bridges the pure command registry to the shell: autocomplete + submit dispatch. */
export class ShellChrome {
  private readonly registry = createBuiltinRegistry();
  private readonly context: ChromeContext;

  constructor(host: ChromeHost, selectors = new ChromeSelectors(host)) {
    this.context = {
      notify: (text) => host.notify(text),
      exit: () => host.exit(),
      openModelSelector: (search) => selectors.openModel(search),
      openThinkingSelector: () => selectors.openThinking(),
      openSessionSelector: () => void selectors.openSessions(),
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
