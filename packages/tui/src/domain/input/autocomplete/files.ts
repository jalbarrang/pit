import { fuzzyFilter } from "../fuzzy.ts";
import type { AutocompleteItem } from "./types.ts";
import type { FileSearchEntry, FileSearchPort } from "./file-port.ts";

export const parsePathPrefix = (prefix: string) => {
  if (prefix.startsWith('@"')) return { rawPrefix: prefix.slice(2), isAtPrefix: true, isQuotedPrefix: true };
  if (prefix.startsWith('"')) return { rawPrefix: prefix.slice(1), isAtPrefix: false, isQuotedPrefix: true };
  if (prefix.startsWith("@")) return { rawPrefix: prefix.slice(1), isAtPrefix: true, isQuotedPrefix: false };
  return { rawPrefix: prefix, isAtPrefix: false, isQuotedPrefix: false };
};

export async function getFileSuggestions(prefix: string, basePath: string, port?: FileSearchPort, signal?: AbortSignal): Promise<AutocompleteItem[]> {
  if (!port) return [];
  const parsed = parsePathPrefix(prefix);
  const recursive = parsed.isAtPrefix && parsed.rawPrefix !== "" && !parsed.rawPrefix.endsWith("/");
  const entries = await port.search(parsed.rawPrefix, basePath, { recursive, signal });
  const ranked = recursive ? rank(entries, parsed.rawPrefix) : sortDirect(entries);
  return ranked.slice(0, 20).map((entry) => itemFor(entry, parsed));
}

const rank = (entries: FileSearchEntry[], query: string): FileSearchEntry[] => {
  const filtered = fuzzyFilter(entries, query, (entry) => entry.path);
  return filtered.sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory));
};
const sortDirect = (entries: FileSearchEntry[]): FileSearchEntry[] =>
  [...entries].sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.path.localeCompare(b.path));
const itemFor = (entry: FileSearchEntry, parsed: ReturnType<typeof parsePathPrefix>): AutocompleteItem => {
  const path = entry.path + (entry.isDirectory && !entry.path.endsWith("/") ? "/" : "");
  return { value: completionValue(path, parsed.isAtPrefix, parsed.isQuotedPrefix), label: label(path), description: path };
};
const label = (path: string): string => path.split("/").filter(Boolean).at(-1) + (path.endsWith("/") ? "/" : "");
const completionValue = (path: string, at: boolean, quoted: boolean): string => {
  const prefix = at ? "@" : "";
  return quoted || path.includes(" ") ? `${prefix}"${path}"` : `${prefix}${path}`;
};
