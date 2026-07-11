#!/usr/bin/env node
// Resolve (and optionally write) release versions for the stable/nightly channels.
//   node scripts/release-version.mjs stable --bump patch|minor|major [--version X.Y.Z] [--write]
//   node scripts/release-version.mjs nightly --date YYYYMMDD --run N
// Emits key=value lines (version, tag, channel) to stdout, and to $GITHUB_OUTPUT when set.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";

const PACKAGE_JSON_PATHS = ["package.json", "packages/app/package.json", "packages/tui/package.json"];

function parseArgs(argv) {
  const [channel, ...rest] = argv;
  const flags = { write: false };
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (arg === "--write") flags.write = true;
    else if (arg.startsWith("--")) flags[arg.slice(2)] = rest[(i += 1)];
    else throw new Error(`unexpected argument: ${arg}`);
  }
  return { channel, flags };
}

function stableCore(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version);
  if (!match) throw new Error(`unparseable version: ${version}`);
  return match.slice(1, 4).map(Number);
}

function bumpVersion(base, bump) {
  const [major, minor, patch] = stableCore(base);
  if (bump === "major") return `${major + 1}.0.0`;
  if (bump === "minor") return `${major}.${minor + 1}.0`;
  if (bump === "patch") return `${major}.${minor}.${patch + 1}`;
  throw new Error(`invalid bump: ${bump}`);
}

function resolveStable(base, flags) {
  if (flags.version) {
    if (!/^\d+\.\d+\.\d+$/.test(flags.version)) throw new Error(`invalid --version: ${flags.version}`);
    return flags.version;
  }
  return bumpVersion(base, flags.bump ?? "patch");
}

function resolveNightly(base, flags) {
  if (!/^\d{8}$/.test(flags.date ?? "")) throw new Error(`invalid --date: ${flags.date}`);
  if (!/^\d+$/.test(flags.run ?? "")) throw new Error(`invalid --run: ${flags.run}`);
  const [major, minor, patch] = stableCore(base);
  return `${major}.${minor}.${patch + 1}-nightly.${flags.date}.${flags.run}`;
}

function writeVersions(version) {
  for (const path of PACKAGE_JSON_PATHS) {
    const pkg = JSON.parse(readFileSync(path, "utf8"));
    pkg.version = version;
    writeFileSync(path, `${JSON.stringify(pkg, null, 2)}\n`);
  }
}

function emit(entries) {
  const lines = entries.map(([key, value]) => `${key}=${value}`);
  console.log(lines.join("\n"));
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join("\n")}\n`);
}

const { channel, flags } = parseArgs(process.argv.slice(2));
const base = JSON.parse(readFileSync("package.json", "utf8")).version;

let version;
if (channel === "stable") version = resolveStable(base, flags);
else if (channel === "nightly") version = resolveNightly(base, flags);
else throw new Error(`usage: release-version.mjs stable|nightly [flags] (got: ${channel})`);

if (flags.write) {
  if (channel !== "stable") throw new Error("--write is only valid for the stable channel");
  writeVersions(version);
}

emit([["version", version], ["tag", `v${version}`], ["channel", channel]]);
