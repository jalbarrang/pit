import { isEnabled, type ScopedState } from "../../domain/models/scoped-state.ts";
import { windowRows } from "./overlay-window.ts";

export interface ScopedModelItem {
  id: string;
  label: string;
  provider: string;
}

export const SCOPED_MODELS_HINT =
  "enter toggle · ctrl+a all · ctrl+x none · ctrl+p provider · alt+↑↓ order · ctrl+s save";

/** 1-based order mark when enabled; three spaces when disabled (aligns with `N. `). */
export function orderMark(state: ScopedState, id: string, universe: string[]): string {
  if (!isEnabled(state, id, universe)) return "   ";
  const n = state.enabled === null ? universe.indexOf(id) + 1 : state.enabled.indexOf(id) + 1;
  return `${n}. `;
}

export function formatModelRow(
  item: ScopedModelItem,
  state: ScopedState,
  universe: string[],
  highlighted: boolean,
): string {
  const on = isEnabled(state, item.id, universe);
  const prefix = highlighted ? "→ " : "  ";
  return `${prefix}${on ? "[x]" : "[ ]"} ${orderMark(state, item.id, universe)}${item.label}`;
}

export function formatOverlayLines(
  filtered: ScopedModelItem[],
  state: ScopedState,
  universe: string[],
  highlightedIndex: number,
  query: string,
  maxVisible = 12,
): string[] {
  const win = windowRows(filtered.length, highlightedIndex, maxVisible);
  const rows = filtered.slice(win.start, win.end).map((item, i) =>
    formatModelRow(item, state, universe, win.start + i === highlightedIndex));
  return [
    "Scoped models",
    `> ${query}`,
    ...(win.above > 0 ? [`↑ ${win.above} more`] : []),
    ...rows,
    ...(win.below > 0 ? [`↓ ${win.below} more`] : []),
    SCOPED_MODELS_HINT,
  ];
}
