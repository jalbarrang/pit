export interface WindowResult {
  start: number;
  end: number;
  above: number;
  below: number;
}

/** Center-ish viewport over `total` rows so `highlight` stays visible. Mirrors ListSelection.window. */
export function windowRows(total: number, highlight: number, maxVisible: number): WindowResult {
  const size = Math.max(1, maxVisible);
  if (total <= 0) return { start: 0, end: 0, above: 0, below: 0 };
  const start = Math.max(0, Math.min(highlight - Math.floor(size / 2), total - size));
  const end = Math.min(start + size, total);
  return { start, end, above: start, below: total - end };
}
