const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" });

const isWide = (point: number): boolean =>
  point >= 0x1100 && (point <= 0x115f || point === 0x2329 || point === 0x232a ||
  (point >= 0x2e80 && point <= 0xa4cf) || (point >= 0xac00 && point <= 0xd7a3) ||
  (point >= 0xf900 && point <= 0xfaff) || (point >= 0xfe10 && point <= 0xfe19) ||
  (point >= 0xfe30 && point <= 0xfe6f) || (point >= 0xff00 && point <= 0xff60) ||
  (point >= 0xffe0 && point <= 0xffe6) || (point >= 0x1f300 && point <= 0x1faff));

const segmentWidth = (segment: string): number => {
  if (segment === "\t") return 4;
  let width = 0;
  for (const char of segment) {
    const point = char.codePointAt(0) ?? 0;
    if (point === 0 || point < 32 || (point >= 0x7f && point < 0xa0)) continue;
    if (/\p{Mark}/u.test(char)) continue;
    width += isWide(point) ? 2 : 1;
  }
  return Math.max(width, 0);
};

export const visibleWidth = (text: string): number =>
  [...graphemes.segment(text)].reduce((sum, item) => sum + segmentWidth(item.segment), 0);

export function sliceByCells(text: string, start: number, width: number): string {
  if (width <= 0) return "";
  let col = 0;
  let out = "";
  for (const { segment } of graphemes.segment(text)) {
    const next = col + segmentWidth(segment);
    if (next <= start) { col = next; continue; }
    if (next > start + width) break;
    out += segment;
    col = next;
  }
  return out;
}

export function truncateToWidth(text: string, width: number, ellipsis = "…", pad = false): string {
  if (width <= 0) return "";
  const clean = text.split(/\r?\n/, 1)[0] ?? "";
  if (visibleWidth(clean) <= width) return padEndCells(clean, width, pad);
  const ellipsisWidth = visibleWidth(ellipsis);
  if (ellipsisWidth > width) return "";
  const prefix = sliceByCells(clean, 0, width - ellipsisWidth);
  return padEndCells(`${prefix}${ellipsis}`, width, pad);
}

export function padEndCells(text: string, width: number, pad = true): string {
  return pad ? text + " ".repeat(Math.max(0, width - visibleWidth(text))) : text;
}
