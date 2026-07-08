import { readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join } from "node:path";
import type { AutocompleteItem } from "./types.ts";

export const parsePathPrefix = (prefix: string) => {
  if (prefix.startsWith('@"')) return { rawPrefix: prefix.slice(2), isAtPrefix: true, isQuotedPrefix: true };
  if (prefix.startsWith('"')) return { rawPrefix: prefix.slice(1), isAtPrefix: false, isQuotedPrefix: true };
  if (prefix.startsWith("@")) return { rawPrefix: prefix.slice(1), isAtPrefix: true, isQuotedPrefix: false };
  return { rawPrefix: prefix, isAtPrefix: false, isQuotedPrefix: false };
};

const display = (value: string): string => value.replace(/\\/g, "/");
const expandHome = (path: string): string => path === "~" ? homedir() : path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
const completionValue = (path: string, at: boolean, quoted: boolean): string => {
  const prefix = at ? "@" : "";
  return quoted || path.includes(" ") ? `${prefix}"${path}"` : `${prefix}${path}`;
};
const isDir = (base: string, name: string, entryDir: boolean, symlink: boolean): boolean => {
  if (entryDir) return true;
  if (!symlink) return false;
  try { return statSync(join(base, name)).isDirectory(); } catch { return false; }
};

export function getFileSuggestions(prefix: string, basePath: string): AutocompleteItem[] {
  try {
    const { rawPrefix, isAtPrefix, isQuotedPrefix } = parsePathPrefix(prefix);
    const expanded = expandHome(rawPrefix);
    const root = rawPrefix === "" || rawPrefix.endsWith("/") || rawPrefix === "~";
    const searchDir = root ? resolveDir(expanded, rawPrefix, basePath) : resolveDir(dirname(expanded), rawPrefix, basePath);
    const searchPrefix = root ? "" : basename(expanded);
    return readdirSync(searchDir, { withFileTypes: true })
      .filter((entry) => entry.name.toLowerCase().startsWith(searchPrefix.toLowerCase()))
      .map((entry) => {
        const dir = isDir(searchDir, entry.name, entry.isDirectory(), entry.isSymbolicLink());
        const path = buildDisplayPath(rawPrefix, entry.name, dir);
        return { value: completionValue(path, isAtPrefix, isQuotedPrefix), label: entry.name + (dir ? "/" : "") };
      })
      .sort((a, b) => Number(b.value.endsWith("/")) - Number(a.value.endsWith("/")) || a.label.localeCompare(b.label));
  } catch {
    return [];
  }
}

const resolveDir = (path: string, raw: string, base: string): string => raw.startsWith("~") || path.startsWith("/") ? path : join(base, path);
const buildDisplayPath = (prefix: string, name: string, directory: boolean): string => {
  const full = prefix.endsWith("/") ? prefix + name : prefix.startsWith("./") ? `./${name}` : prefix.includes("/") ? join(dirname(prefix), name) : prefix.startsWith("~") ? `~/${name}` : name;
  return display(full) + (directory ? "/" : "");
};
