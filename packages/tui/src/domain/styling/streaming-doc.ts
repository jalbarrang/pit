export interface StreamingDocSlice {
  cacheHit: boolean;
  stablePrefix: string;
  tail: string;
  full: string;
}

/** Split markdown at the last blank-line boundary; cache stable prefix across deltas. */
export class StreamingDoc {
  private cachedPrefix = "";

  apply(full: string): StreamingDocSlice {
    const splitAt = full.lastIndexOf("\n\n");
    const stablePrefix = splitAt >= 0 ? full.slice(0, splitAt + 2) : "";
    const tail = splitAt >= 0 ? full.slice(splitAt + 2) : full;
    const cacheHit = this.cachedPrefix.length > 0 && this.cachedPrefix === stablePrefix;
    this.cachedPrefix = stablePrefix;
    return { cacheHit, stablePrefix, tail, full };
  }

  reset(): void {
    this.cachedPrefix = "";
  }
}
