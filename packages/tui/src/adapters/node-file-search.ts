import { readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, relative, resolve } from "node:path";
import type { FileSearchEntry, FileSearchOptions, FileSearchPort } from "../domain/input/index.ts";

export class NodeFileSearchPort implements FileSearchPort {
  search(rawPrefix: string, basePath: string, options: FileSearchOptions): FileSearchEntry[] {
    const expanded = expandHome(rawPrefix);
    const root = rawPrefix === "" || rawPrefix.endsWith("/") || rawPrefix === "~";
    if (options.recursive) return recursiveEntries(basePath, rawPrefix, options.signal);
    const dirPrefix = root ? expanded : dirname(expanded);
    const searchDir = resolveDir(dirPrefix, rawPrefix, basePath);
    const searchPrefix = root ? "" : basename(expanded).toLowerCase();
    return listDir(searchDir)
      .filter((entry) => entry.name.toLowerCase().startsWith(searchPrefix))
      .map((entry) => ({ path: displayPath(rawPrefix, entry.name, entry.isDirectory), isDirectory: entry.isDirectory }));
  }
}

const expandHome = (path: string): string => path === "~" ? homedir() : path.startsWith("~/") ? join(homedir(), path.slice(2)) : path;
const resolveDir = (path: string, raw: string, base: string): string => raw.startsWith("~") || path.startsWith("/") ? path : join(base, path);
const display = (path: string): string => path.replace(/\\/g, "/");
const listDir = (dir: string): Array<{ name: string; isDirectory: boolean }> => {
  try {
    return readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.name !== ".git").map((entry) => ({ name: entry.name, isDirectory: isDir(dir, entry.name, entry.isDirectory(), entry.isSymbolicLink()) }));
  } catch { return []; }
};
const isDir = (base: string, name: string, dir: boolean, link: boolean): boolean => {
  if (dir) return true;
  if (!link) return false;
  try { return statSync(join(base, name)).isDirectory(); } catch { return false; }
};
const displayPath = (prefix: string, name: string, directory: boolean): string => {
  const full = prefix.endsWith("/") ? prefix + name : prefix.startsWith("./") ? `./${name}` : prefix.includes("/") ? join(dirname(prefix), name) : prefix.startsWith("~") ? `~/${name}` : name;
  return display(full) + (directory ? "/" : "");
};
const recursiveEntries = (basePath: string, query: string, signal?: AbortSignal): FileSearchEntry[] => {
  const root = scopedRoot(basePath, query);
  const out: FileSearchEntry[] = [];
  const walk = (dir: string): void => {
    if (signal?.aborted || out.length > 300) return;
    for (const entry of listDir(dir)) {
      const abs = join(dir, entry.name);
      const rel = display(relative(basePath, abs));
      out.push({ path: rel + (entry.isDirectory ? "/" : ""), isDirectory: entry.isDirectory });
      if (entry.isDirectory) walk(abs);
    }
  };
  walk(root);
  return out;
};
const scopedRoot = (basePath: string, query: string): string => {
  const slash = query.lastIndexOf("/");
  if (slash < 0) return basePath;
  return resolve(basePath, query.slice(0, slash + 1));
};
