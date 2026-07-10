import { isEnabled, type ScopedState } from "../../domain/models/scoped-state.ts";

export interface ScopedModelItem {
  id: string;
  label: string;
  provider: string;
}

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
): string[] {
  return [
    `> ${query}`,
    ...filtered.map((item, i) => formatModelRow(item, state, universe, i === highlightedIndex)),
  ];
}
