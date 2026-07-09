import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ImagePart } from "../../domain/index.ts";

export interface ClipboardImageDeps {
  platform: string;
  tmpPath: string;
  run(cmd: string, args: string[]): { status: number | null };
  readFileBase64(path: string): string | null;
  removeFile(path: string): void;
}

export function readClipboardImage(deps: ClipboardImageDeps): ImagePart | null {
  if (deps.platform !== "darwin") return null;
  const script = [
    "-e", "set thePng to (the clipboard as «class PNGf»)",
    "-e", `set fp to open for access POSIX file ${JSON.stringify(deps.tmpPath)} with write permission`,
    "-e", "write thePng to fp",
    "-e", "close access fp",
  ];
  const result = deps.run("osascript", script);
  if (result.status !== 0) {
    deps.removeFile(deps.tmpPath);
    return null;
  }
  const data = deps.readFileBase64(deps.tmpPath);
  deps.removeFile(deps.tmpPath);
  if (!data) return null;
  return { data, mimeType: "image/png", filename: "clipboard.png" };
}

export function createClipboardImageDeps(platform = process.platform): ClipboardImageDeps {
  const tmpPath = join(tmpdir(), `pit-clip-${Date.now()}.png`);
  return {
    platform,
    tmpPath,
    run: (cmd, args) => spawnSync(cmd, args, { encoding: undefined }),
    readFileBase64: (path) => {
      if (!existsSync(path) || statSync(path).size === 0) return null;
      return readFileSync(path).toString("base64");
    },
    removeFile: (path) => {
      try {
        unlinkSync(path);
      } catch {
        /* ignore missing temp file */
      }
    },
  };
}
