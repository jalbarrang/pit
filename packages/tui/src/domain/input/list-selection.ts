export class ListSelection<T> {
  private allItems: T[];
  private visibleItems: T[];
  selectedIndex = 0;

  constructor(items: T[]) {
    this.allItems = [...items];
    this.visibleItems = [...items];
  }

  get items(): T[] { return [...this.allItems]; }
  set items(items: T[]) {
    this.allItems = [...items];
    this.visibleItems = [...items];
    this.selectedIndex = Math.min(this.selectedIndex, Math.max(0, this.visibleItems.length - 1));
  }
  get filteredItems(): T[] { return [...this.visibleItems]; }
  get selectedItem(): T | null { return this.visibleItems[this.selectedIndex] ?? null; }

  filter(predicate: (item: T) => boolean): void {
    this.visibleItems = this.allItems.filter(predicate);
    this.selectedIndex = 0;
  }

  replaceFiltered(items: T[]): void {
    this.visibleItems = [...items];
    this.selectedIndex = 0;
  }

  setSelectedIndex(index: number): void {
    this.selectedIndex = clamp(index, 0, Math.max(0, this.visibleItems.length - 1));
  }

  move(delta: number, wrap = true): void {
    const length = this.visibleItems.length;
    if (length === 0) return;
    const next = this.selectedIndex + delta;
    this.selectedIndex = wrap ? ((next % length) + length) % length : clamp(next, 0, length - 1);
  }

  page(delta: number): void {
    this.move(delta, false);
  }

  home(): void { this.setSelectedIndex(0); }
  end(): void { this.setSelectedIndex(this.visibleItems.length - 1); }

  window(maxVisible: number): { start: number; end: number; items: T[] } {
    const size = Math.max(1, maxVisible);
    const start = Math.max(0, Math.min(this.selectedIndex - Math.floor(size / 2), this.visibleItems.length - size));
    const end = Math.min(start + size, this.visibleItems.length);
    return { start, end, items: this.visibleItems.slice(start, end) };
  }
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(value, max));
