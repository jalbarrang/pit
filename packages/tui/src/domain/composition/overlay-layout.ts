import { resolveAnchorCol, resolveAnchorRow } from "./anchor-resolver.ts";
import { parseSizeValue } from "./size-value.ts";
import type { OverlayMargin, OverlayOptions } from "./overlay-types.ts";

export interface OverlayLayout { width: number; row: number; col: number; maxHeight?: number }

type Margins = Required<OverlayMargin>;
const margins = (margin: OverlayOptions["margin"]): Margins => {
  const value = typeof margin === "number" ? { top: margin, right: margin, bottom: margin, left: margin } : (margin ?? {});
  return {
    top: Math.max(0, value.top ?? 0),
    right: Math.max(0, value.right ?? 0),
    bottom: Math.max(0, value.bottom ?? 0),
    left: Math.max(0, value.left ?? 0),
  };
};

export function resolveOverlayLayout(options: OverlayOptions | undefined, overlayHeight: number, termWidth: number, termHeight: number): OverlayLayout {
  const opt = options ?? {};
  const margin = margins(opt.margin);
  const availWidth = Math.max(1, termWidth - margin.left - margin.right);
  const availHeight = Math.max(1, termHeight - margin.top - margin.bottom);
  let width = parseSizeValue(opt.width, termWidth) ?? Math.min(80, availWidth);
  if (opt.minWidth !== undefined) width = Math.max(width, opt.minWidth);
  width = Math.max(1, Math.min(width, availWidth));
  const parsedMaxHeight = parseSizeValue(opt.maxHeight, termHeight);
  const maxHeight = parsedMaxHeight === undefined ? undefined : Math.max(1, Math.min(parsedMaxHeight, availHeight));
  const effectiveHeight = maxHeight === undefined ? overlayHeight : Math.min(overlayHeight, maxHeight);
  let row = opt.row === undefined ? anchorRow(opt, effectiveHeight, availHeight, margin.top) : resolvePosition(opt.row, availHeight, effectiveHeight, margin.top);
  let col = opt.col === undefined ? anchorCol(opt, width, availWidth, margin.left) : resolvePosition(opt.col, availWidth, width, margin.left);
  row += opt.offsetY ?? 0;
  col += opt.offsetX ?? 0;
  row = Math.max(margin.top, Math.min(row, termHeight - margin.bottom - effectiveHeight));
  col = Math.max(margin.left, Math.min(col, termWidth - margin.right - width));
  return maxHeight === undefined ? { width, row, col } : { width, row, col, maxHeight };
}

const anchorRow = (opt: OverlayOptions, height: number, avail: number, margin: number): number => resolveAnchorRow(opt.anchor ?? "center", height, avail, margin);
const anchorCol = (opt: OverlayOptions, width: number, avail: number, margin: number): number => resolveAnchorCol(opt.anchor ?? "center", width, avail, margin);
const resolvePosition = (value: number | `${number}%`, available: number, size: number, margin: number): number => {
  if (typeof value === "number") return value;
  const parsed = parseSizeValue(value, 100);
  if (parsed === undefined) return margin + Math.floor((available - size) / 2);
  return margin + Math.floor(Math.max(0, available - size) * (parsed / 100));
};
