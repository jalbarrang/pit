import { fuzzyFilter } from "../fuzzy.ts";
import { extractAtPrefix, extractPathPrefix } from "./path-prefix.ts";
import { getFileSuggestions, parsePathPrefix } from "./files.ts";
import type { FileSearchPort } from "./file-port.ts";
import type { AutocompleteItem, AutocompleteProvider, AutocompleteSuggestions, SlashCommand } from "./types.ts";

export class CombinedAutocompleteProvider implements AutocompleteProvider {
  private commands: (SlashCommand | AutocompleteItem)[];
  private basePath: string;
  private fileSearch?: FileSearchPort;
  constructor(commands: (SlashCommand | AutocompleteItem)[] = [], basePath: string, fileSearch?: FileSearchPort) {
    this.commands = commands;
    this.basePath = basePath;
    this.fileSearch = fileSearch;
  }

  async getSuggestions(lines: string[], cursorLine: number, cursorCol: number, options: { signal: AbortSignal; force?: boolean }): Promise<AutocompleteSuggestions | null> {
    const text = (lines[cursorLine] || "").slice(0, cursorCol);
    const atPrefix = extractAtPrefix(text);
    if (atPrefix) return this.files(atPrefix, options.signal);
    const slash = await this.slashSuggestions(text, options.force ?? false);
    if (slash) return slash;
    const pathPrefix = extractPathPrefix(text, options.force ?? false);
    return pathPrefix === null ? null : this.files(pathPrefix, options.signal);
  }

  applyCompletion(lines: string[], cursorLine: number, cursorCol: number, item: AutocompleteItem, prefix: string) {
    const current = lines[cursorLine] || "";
    const before = current.slice(0, cursorCol - prefix.length);
    const after = current.slice(cursorCol);
    const command = prefix.startsWith("/") && before.trim() === "" && !prefix.slice(1).includes("/");
    const suffix = command ? " " : prefix.startsWith("@") && !item.label.endsWith("/") ? " " : "";
    const value = command ? `/${item.value}` : item.value;
    const next = [...lines];
    next[cursorLine] = before + value + suffix + after;
    return { lines: next, cursorLine, cursorCol: before.length + value.length + suffix.length };
  }

  shouldTriggerFileCompletion(lines: string[], cursorLine: number, cursorCol: number): boolean {
    const text = (lines[cursorLine] || "").slice(0, cursorCol).trim();
    return !(text.startsWith("/") && !text.includes(" "));
  }

  private async files(prefix: string, signal: AbortSignal): Promise<AutocompleteSuggestions | null> {
    const { rawPrefix } = parsePathPrefix(prefix);
    const items = await getFileSuggestions(prefix, this.basePath, this.fileSearch, signal);
    if (items.length === 0 && rawPrefix !== "/") return null;
    return { items, prefix };
  }

  private async slashSuggestions(text: string, force: boolean): Promise<AutocompleteSuggestions | null> {
    if (force || !text.startsWith("/")) return null;
    const space = text.indexOf(" ");
    if (space === -1) {
      const items = fuzzyFilter(this.commands.map(commandItem), text.slice(1), (item) => item.value);
      return items.length ? { items, prefix: text } : null;
    }
    const name = text.slice(1, space);
    const argument = text.slice(space + 1);
    const command = this.commands.find((item) => ("name" in item ? item.name : item.value) === name);
    if (!command || !("getArgumentCompletions" in command) || !command.getArgumentCompletions) return null;
    const items = await command.getArgumentCompletions(argument);
    return items?.length ? { items, prefix: argument } : null;
  }
}

const commandItem = (command: SlashCommand | AutocompleteItem): AutocompleteItem => {
  if (!("name" in command)) return command;
  const description = command.argumentHint ? `${command.argumentHint}${command.description ? ` — ${command.description}` : ""}` : command.description;
  return { value: command.name, label: command.name, ...(description ? { description } : {}) };
};
