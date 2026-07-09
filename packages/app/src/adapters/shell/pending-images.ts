import type { ImagePart } from "../../domain/index.ts";

export class PendingImages {
  private items: ImagePart[] = [];
  push(image: ImagePart): number { this.items.push(image); return this.items.length; }
  takeAll(): ImagePart[] { const out = this.items; this.items = []; return out; }
  get count(): number { return this.items.length; }
}
