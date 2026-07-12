export type UpdateChannel = "stable" | "nightly" | "dev";
export interface ReleaseSummary { tag: string; prerelease: boolean }

interface ParsedVersion {
  channel: Exclude<UpdateChannel, "dev">;
  tuple: number[];
}

const numbers = (parts: string[]): number[] | null => {
  const tuple = parts.map(Number);
  return tuple.every(Number.isSafeInteger) ? tuple : null;
};

export const parseVersion = (value: string): ParsedVersion | null => {
  const stable = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (stable) {
    const tuple = numbers(stable.slice(1));
    return tuple ? { channel: "stable", tuple } : null;
  }
  const nightly = /^v?(\d+)\.(\d+)\.(\d+)-nightly\.(\d{8})\.(\d+)$/.exec(value);
  if (!nightly) return null;
  const tuple = numbers(nightly.slice(1));
  return tuple ? { channel: "nightly", tuple } : null;
};

const compareTuple = (left: number[], right: number[]): number => {
  for (let i = 0; i < left.length; i++) {
    if (left[i] !== right[i]) return left[i]! > right[i]! ? 1 : -1;
  }
  return 0;
};

export const compareVersions = (left: string, right: string, channel: UpdateChannel): number | null => {
  if (channel === "dev") return null;
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (a?.channel !== channel || b?.channel !== channel) return null;
  return compareTuple(a.tuple, b.tuple);
};

export const pickLatest = (channel: UpdateChannel, releases: ReleaseSummary[]): string | null => {
  if (channel === "dev") return null;
  let latest: string | null = null;
  for (const release of releases) {
    if (release.prerelease !== (channel === "nightly")) continue;
    const parsed = parseVersion(release.tag);
    if (parsed?.channel !== channel) continue;
    if (!latest || compareVersions(release.tag, latest, channel) === 1) latest = release.tag;
  }
  return latest;
};

export const availableUpdate = (current: string, channel: UpdateChannel, releases: ReleaseSummary[]): string | null => {
  const latest = pickLatest(channel, releases);
  return latest && compareVersions(latest, current, channel) === 1 ? latest : null;
};
