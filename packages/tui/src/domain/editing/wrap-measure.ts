import { segmentWidth } from "../styling/index.ts";

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });
const cjk = /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Hangul}\p{Script_Extensions=Bopomofo}]/u;

interface Segment { text: string; index: number; width: number }
export interface WrapChunk { start: number; end: number }

const segmentsOf = (line: string): Segment[] => [...graphemes.segment(line)].map(({ segment, index }) => ({ text: segment, index, width: segmentWidth(segment) }));
const isSpace = (text: string): boolean => /^\s+$/u.test(text);
const canCjkBreak = (left: string, right: string): boolean => cjk.test(left) && cjk.test(right);

export function wrapChunks(line: string, width: number): WrapChunk[] {
  if (!line) return [{ start: 0, end: 0 }];
  const max = Math.max(1, width);
  const chunks: WrapChunk[] = [];
  const segments = segmentsOf(line);
  let start = 0;
  let cells = 0;
  let wrap = -1;
  let wrapCells = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (cells + seg.width > max) {
      if (wrap >= 0 && cells - wrapCells + seg.width <= max) {
        chunks.push({ start, end: wrap });
        start = wrap;
        cells -= wrapCells;
      } else if (start < seg.index) {
        chunks.push({ start, end: seg.index });
        start = seg.index;
        cells = 0;
      }
      wrap = -1;
    }
    cells += seg.width;
    const next = segments[i + 1];
    if (next && isSpace(seg.text) && !isSpace(next.text)) { wrap = next.index; wrapCells = cells; }
    else if (next && !isSpace(seg.text) && !isSpace(next.text) && canCjkBreak(seg.text, next.text)) { wrap = next.index; wrapCells = cells; }
  }
  chunks.push({ start, end: line.length });
  return chunks;
}

export function cellsBetween(line: string, start: number, end: number): number {
  return segmentsOf(line.slice(start, end)).reduce((sum, seg) => sum + seg.width, 0);
}

export function colAtCells(line: string, start: number, cells: number): number {
  let seen = 0;
  for (const seg of segmentsOf(line.slice(start))) {
    if (seen + seg.width > cells) return start + seg.index;
    seen += seg.width;
  }
  return line.length;
}
