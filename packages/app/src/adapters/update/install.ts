import { execFile } from "node:child_process";
import { createHash, timingSafeEqual } from "node:crypto";
import { chmod, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { UpdateChannel } from "../../domain/update/index.ts";

const DOWNLOAD_BASE = "https://github.com/jalbarrang/pit/releases/download";
const triples: Record<string, string> = {
  "darwin-arm64": "aarch64-apple-darwin",
  "darwin-x64": "x86_64-apple-darwin",
  "linux-x64": "x86_64-unknown-linux-gnu",
  "linux-arm64": "aarch64-unknown-linux-gnu",
};

interface DownloadResponse {
  ok: boolean;
  arrayBuffer(): Promise<ArrayBuffer | Uint8Array>;
  text(): Promise<string>;
}
type DownloadFetch = (url: string) => Promise<DownloadResponse>;
type Extract = (archive: string, destination: string) => Promise<void>;

export interface InstallOptions {
  fetch?: DownloadFetch;
  execPath?: string;
  platform?: NodeJS.Platform;
  arch?: NodeJS.Architecture;
  extract?: Extract;
}

export const platformTriple = (platform: NodeJS.Platform = process.platform, arch: NodeJS.Architecture = process.arch): string => {
  const triple = triples[`${platform}-${arch}`];
  if (!triple) throw new Error(`unsupported platform: ${platform}-${arch}`);
  return triple;
};

const extractTar: Extract = (archive, destination) => new Promise((resolve, reject) => {
  execFile("tar", ["-xzf", archive, "-C", destination, "pit"], (error) => error ? reject(error) : resolve());
});

const assertChecksum = (archive: Buffer, checksum: string, asset: string): void => {
  const match = /^([a-f\d]{64})\s+\*?([^\r\n]+)\s*$/i.exec(checksum);
  const actual = createHash("sha256").update(archive).digest();
  const expected = match ? Buffer.from(match[1]!, "hex") : Buffer.alloc(0);
  if (!match || match[2] !== asset || expected.length !== actual.length || !timingSafeEqual(actual, expected)) {
    throw new Error(`checksum mismatch for ${asset}`);
  }
};

export const atomicSwap = async (source: string, target: string): Promise<void> => {
  await chmod(source, 0o755);
  await rename(source, target);
};

export const installRelease = async (tag: string, channel: UpdateChannel, options: InstallOptions = {}): Promise<void> => {
  if (channel === "dev") throw new Error("running from source; use git pull");
  const fetcher = options.fetch ?? globalThis.fetch as unknown as DownloadFetch;
  const target = options.execPath ?? process.execPath;
  const asset = `pit-${platformTriple(options.platform, options.arch)}.tar.gz`;
  const url = `${DOWNLOAD_BASE}/${encodeURIComponent(tag)}/${asset}`;
  const temp = await mkdtemp(join(dirname(target), ".pit-update-"));
  try {
    const [archiveResponse, checksumResponse] = await Promise.all([fetcher(url), fetcher(`${url}.sha256`)]);
    if (!archiveResponse.ok || !checksumResponse.ok) throw new Error(`failed to download ${asset}`);
    const bytes = await archiveResponse.arrayBuffer();
    const archive = Buffer.from(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
    assertChecksum(archive, await checksumResponse.text(), asset);
    const archivePath = join(temp, asset);
    await writeFile(archivePath, archive);
    await (options.extract ?? extractTar)(archivePath, temp);
    await atomicSwap(join(temp, "pit"), target);
  } finally { await rm(temp, { recursive: true, force: true }); }
};
