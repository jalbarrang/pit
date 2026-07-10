import { spawnSync } from "node:child_process";

export interface GitBranchDeps {
  run(cmd: string, args: string[]): { status: number | null; stdout?: string };
  now(): number;
}

const TTL_MS = 5000;

const defaults: GitBranchDeps = {
  run: (cmd, args) => spawnSync(cmd, args, { encoding: "utf-8" }),
  now: () => Date.now(),
};

export function createGitBranch(deps?: Partial<GitBranchDeps>): () => string {
  const { run, now } = { ...defaults, ...deps };
  let cached = "";
  let cachedAt = -Infinity;
  return () => {
    const t = now();
    if (t - cachedAt < TTL_MS) return cached;
    cachedAt = t;
    try {
      const result = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
      cached = result.status === 0 ? (result.stdout ?? "").trim() : "";
    } catch {
      cached = "";
    }
    return cached;
  };
}
