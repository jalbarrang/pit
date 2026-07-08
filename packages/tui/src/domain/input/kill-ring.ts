export class KillRing {
  private ring: string[] = [];
  push(text: string, opts: { prepend: boolean; accumulate?: boolean }): void {
    if (!text) return;
    if (opts.accumulate && this.ring.length > 0) {
      const last = this.ring.pop()!;
      this.ring.push(opts.prepend ? text + last : last + text);
    } else {
      this.ring.push(text);
    }
  }
  peek(): string | undefined {
    return this.ring.at(-1);
  }
  rotate(): void {
    if (this.ring.length > 1) this.ring.unshift(this.ring.pop()!);
  }
  get length(): number {
    return this.ring.length;
  }
}
