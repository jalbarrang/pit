export class PromptHistory {
  private items: string[] = [];
  private index = -1;
  private draft = "";
  add(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.items[0] === trimmed) return;
    this.items.unshift(trimmed);
    if (this.items.length > 100) this.items.pop();
  }
  reset(): void { this.index = -1; this.draft = ""; }
  browse(current: string, direction: -1 | 1): string | null {
    if (this.items.length === 0) return null;
    const next = this.index - direction;
    if (next < -1 || next >= this.items.length) return null;
    if (this.index === -1) this.draft = current;
    this.index = next;
    return this.index === -1 ? this.draft : this.items[this.index]!;
  }
  get browsing(): boolean { return this.index >= 0; }
}
