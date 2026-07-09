import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { extensionForMimeType, type OpenableImage } from "../../../domain/index.ts";

export interface ImageViewer { open(image: OpenableImage): Promise<string> }

export class MacOpenImageViewer implements ImageViewer {
  async open(image: OpenableImage): Promise<string> {
    const dir = mkdtempSync(join(tmpdir(), "pit-image-"));
    const file = join(dir, image.filename ?? `${image.id}.${extensionForMimeType(image.mimeType)}`);
    writeFileSync(file, Buffer.from(image.data, "base64"));
    await new Promise<void>((resolve, reject) => {
      const child = spawn("open", [file], { stdio: "ignore", detached: true });
      child.once("error", reject);
      child.once("spawn", () => { child.unref(); resolve(); });
    });
    return file;
  }
}
