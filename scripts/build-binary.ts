#!/usr/bin/env bun
/**
 * Cross-compiles pit release binaries with Bun 1.3.14.
 * Linux assets use GNU triples for both x64 and arm64.
 */
import { mkdirSync, realpathSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { packageBinary, parseArgs, targets, verifyBinary } from "./build-binary-lib.ts";

const repo = realpathSync(join(import.meta.dir, ".."));
process.chdir(repo);
const { target, version, channel } = parseArgs(process.argv.slice(2));
const config = targets[target];
const dist = join(repo, "dist");
const outputDir = join(dist, `pit-${config.triple}`);
const binary = join(outputDir, "pit");
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const require = createRequire(import.meta.url);
const corePackage = realpathSync(require.resolve("@opentui/core/package.json", { paths: ["packages/app"] }));
const parserWorker = realpathSync(join(dirname(corePackage), "parser.worker.js"));
const workerRelativePath = relative(repo, parserWorker).replaceAll("\\", "/");

console.log(`Building pit ${version} (${channel}) for ${target}...`);
const result = await Bun.build({
  entrypoints: ["./packages/app/src/main.ts", parserWorker],
  conditions: ["bun", "node"],
  format: "esm",
  splitting: true,
  compile: { target: config.bun, outfile: binary },
  define: {
    OTUI_TREE_SITTER_WORKER_PATH: JSON.stringify(`/$bunfs/root/${workerRelativePath}`),
    PIT_VERSION: JSON.stringify(version),
    PIT_CHANNEL: JSON.stringify(channel),
  },
});
if (!result.success) {
  for (const log of result.logs) console.error(log);
  throw new Error(`Bun.build failed for ${target}`);
}
await verifyBinary(target, binary, repo);
await packageBinary(binary, dist, config.triple);
