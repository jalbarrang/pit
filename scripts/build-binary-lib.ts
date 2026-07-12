import { mkdirSync, rmSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { $ } from "bun";

export const targets = {
  "darwin-arm64": { bun: "bun-darwin-arm64", triple: "aarch64-apple-darwin" },
  "darwin-x64": { bun: "bun-darwin-x64", triple: "x86_64-apple-darwin" },
  "linux-x64": { bun: "bun-linux-x64", triple: "x86_64-unknown-linux-gnu" },
  "linux-arm64": { bun: "bun-linux-arm64", triple: "aarch64-unknown-linux-gnu" },
} as const;
export type TargetName = keyof typeof targets;

export const parseArgs = (args: string[]): { target: TargetName; version: string; channel: "stable" | "nightly" } => {
  const values = new Map<string, string>();
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    if (!key?.startsWith("--") || !value) throw new Error("usage: build-binary.ts --target TARGET --version VERSION --channel CHANNEL");
    values.set(key.slice(2), value);
  }
  const target = values.get("target");
  const version = values.get("version");
  const channel = values.get("channel");
  if (!target || !(target in targets)) throw new Error(`invalid target: ${target ?? "missing"}`);
  if (!version || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(version)) throw new Error(`invalid version: ${version ?? "missing"}`);
  if (channel !== "stable" && channel !== "nightly") throw new Error(`invalid channel: ${channel ?? "missing"}`);
  return { target: target as TargetName, version, channel };
};

const nativeTarget = (): string => `${process.platform}-${process.arch}`;
const tmux = (...args: string[]) => Bun.spawnSync(["tmux", "-L", "pitbuild", ...args], { stdout: "pipe", stderr: "pipe" });

export const verifyBinary = async (target: TargetName, binary: string, repo: string): Promise<void> => {
  const size = statSync(binary).size;
  if (size <= 20 * 1024 * 1024) throw new Error(`binary is too small: ${size} bytes`);
  if (target !== nativeTarget()) {
    console.log(`Cross-target check passed (${Math.round(size / 1024 / 1024)} MB); skipping frame smoke test.`);
    return;
  }
  if (!Bun.which("tmux")) throw new Error("tmux is required for the native frame smoke test");
  tmux("kill-server");
  const command = `'${binary.replaceAll("'", "'\\''")}' --cwd '${repo.replaceAll("'", "'\\''")}'`;
  const started = tmux("new-session", "-d", "-s", "pit-smoke", "-x", "100", "-y", "30", command);
  if (started.exitCode !== 0) throw new Error(`tmux failed to start: ${started.stderr.toString()}`);
  let pane = "";
  try {
    const deadline = Date.now() + 15_000;
    while (Date.now() < deadline) {
      await Bun.sleep(250);
      const captured = tmux("capture-pane", "-p", "-t", "pit-smoke");
      pane = captured.stdout.toString();
      if (pane.includes("│")) {
        console.log(`Native frame smoke test passed (${Math.round(size / 1024 / 1024)} MB).`);
        return;
      }
    }
    throw new Error(`no rendered footer frame within 15s\n${pane}`);
  } finally {
    tmux("kill-server");
  }
};

export const packageBinary = async (binary: string, dist: string, triple: string): Promise<void> => {
  mkdirSync(dist, { recursive: true });
  const asset = `pit-${triple}.tar.gz`;
  const archive = join(dist, asset);
  rmSync(archive, { force: true });
  rmSync(`${archive}.sha256`, { force: true });
  await $`tar -czf ${archive} pit`.cwd(join(dist, `pit-${triple}`)).quiet();
  const checksum = await $`shasum -a 256 ${asset}`.cwd(dist).text();
  await Bun.write(`${archive}.sha256`, checksum);
  console.log(`Created ${basename(archive)} and ${basename(archive)}.sha256`);
};
