import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { ReleaseSummary } from "../../domain/update/index.ts";

export const GITHUB_RELEASES_URL = "https://api.github.com/repos/jalbarrang/pit/releases?per_page=30";
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1_000;

interface FetchResponse {
  ok: boolean;
  json(): Promise<unknown>;
}
export type ReleaseFetch = (url: string, init?: { headers?: Record<string, string> }) => Promise<FetchResponse>;

export interface FetchReleasesOptions {
  fetch?: ReleaseFetch;
  statePath?: string;
  force?: boolean;
  now?: () => number;
}

const isFresh = async (path: string, now: number): Promise<boolean> => {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8")) as { checkedAt?: unknown };
    return typeof parsed.checkedAt === "number" && now - parsed.checkedAt < CHECK_INTERVAL_MS;
  } catch { return false; }
};

const mapRelease = (value: unknown): ReleaseSummary => {
  if (!value || typeof value !== "object") throw new Error("invalid release response");
  const item = value as { tag_name?: unknown; prerelease?: unknown };
  if (typeof item.tag_name !== "string" || typeof item.prerelease !== "boolean") throw new Error("invalid release response");
  return { tag: item.tag_name, prerelease: item.prerelease };
};

export const fetchReleases = async (options: FetchReleasesOptions = {}): Promise<ReleaseSummary[] | null> => {
  const fetcher = options.fetch ?? globalThis.fetch as unknown as ReleaseFetch;
  const statePath = options.statePath ?? join(homedir(), ".pit", "update-check.json");
  const now = (options.now ?? Date.now)();
  try {
    if (!options.force && await isFresh(statePath, now)) return null;
    await mkdir(dirname(statePath), { recursive: true });
    await writeFile(statePath, JSON.stringify({ checkedAt: now }), "utf8");
    const response = await fetcher(GITHUB_RELEASES_URL, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) return null;
    const body = await response.json();
    if (!Array.isArray(body)) return null;
    return body.map(mapRelease);
  } catch { return null; }
};
