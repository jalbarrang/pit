import { isWhitespaceChar, PUNCTUATION_REGEX, wordSegmenter } from "./word-utils.ts";

export interface WordNavigationOptions {
  segment?: (text: string) => Iterable<Intl.SegmentData>;
  isAtomicSegment?: (segment: string) => boolean;
}

export function findWordBackward(text: string, cursor: number, options?: WordNavigationOptions): number {
  if (cursor <= 0) return 0;
  const segmentFn = options?.segment;
  const isAtomic = options?.isAtomicSegment;
  const segments = segmentFn ? [...segmentFn(text.slice(0, cursor))] : [...wordSegmenter.segment(text.slice(0, cursor))];
  let next = cursor;
  while (segments.length > 0 && !isAtomic?.(last(segments).segment) && isWhitespaceChar(last(segments).segment)) {
    next -= segments.pop()!.segment.length;
  }
  if (segments.length === 0) return next;
  const item = last(segments);
  if (isAtomic?.(item.segment)) return next - item.segment.length;
  if (item.isWordLike) {
    const matches = [...item.segment.matchAll(new RegExp(PUNCTUATION_REGEX, "g"))];
    if (matches.length === 0) return next - item.segment.length;
    const match = matches[matches.length - 1]!;
    return next - (item.segment.length - (match.index + match[0].length));
  }
  while (segments.length > 0 && !isAtomic?.(last(segments).segment) && !last(segments).isWordLike && !isWhitespaceChar(last(segments).segment)) {
    next -= segments.pop()!.segment.length;
  }
  return next;
}

export function findWordForward(text: string, cursor: number, options?: WordNavigationOptions): number {
  if (cursor >= text.length) return text.length;
  const segmentFn = options?.segment;
  const isAtomic = options?.isAtomicSegment;
  const segments = segmentFn ? segmentFn(text.slice(cursor)) : wordSegmenter.segment(text.slice(cursor));
  const iterator = segments[Symbol.iterator]();
  let current = iterator.next();
  let next = cursor;
  while (!current.done && !isAtomic?.(current.value.segment) && isWhitespaceChar(current.value.segment)) {
    next += current.value.segment.length;
    current = iterator.next();
  }
  if (current.done) return next;
  if (isAtomic?.(current.value.segment)) return next + current.value.segment.length;
  if (current.value.isWordLike) return next + (PUNCTUATION_REGEX.exec(current.value.segment)?.index ?? current.value.segment.length);
  while (!current.done && !isAtomic?.(current.value.segment) && !current.value.isWordLike && !isWhitespaceChar(current.value.segment)) {
    next += current.value.segment.length;
    current = iterator.next();
  }
  return next;
}

const last = <T>(items: T[]): T => items[items.length - 1]!;
