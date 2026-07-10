export interface ScopedState {
  enabled: string[] | null;
}

export function isEnabled(state: ScopedState, id: string, universe: string[]): boolean {
  if (state.enabled === null) return universe.includes(id);
  return state.enabled.includes(id);
}

/** Upstream scoped-models-selector.ts:25-30 — null → [id]; off removes; on appends. */
export function toggle(state: ScopedState, id: string, _universe: string[]): ScopedState {
  if (state.enabled === null) return { enabled: [id] };
  const index = state.enabled.indexOf(id);
  if (index >= 0) {
    return { enabled: [...state.enabled.slice(0, index), ...state.enabled.slice(index + 1)] };
  }
  return { enabled: [...state.enabled, id] };
}

export function enableAll(state: ScopedState, filteredIds: string[], universe: string[]): ScopedState {
  if (state.enabled === null) return { enabled: null };
  const result = [...state.enabled];
  for (const id of filteredIds) {
    if (!result.includes(id)) result.push(id);
  }
  return { enabled: result.length === universe.length ? null : result };
}

export function clearAll(state: ScopedState, filteredIds: string[], universe: string[]): ScopedState {
  if (state.enabled === null) {
    return { enabled: universe.filter((id) => !filteredIds.includes(id)) };
  }
  const targets = new Set(filteredIds);
  return { enabled: state.enabled.filter((id) => !targets.has(id)) };
}

function providerOf(fullId: string): string {
  const slash = fullId.indexOf("/");
  return slash < 0 ? fullId : fullId.slice(0, slash);
}

export function toggleProvider(state: ScopedState, provider: string, universe: string[]): ScopedState {
  const providerIds = universe.filter((id) => providerOf(id) === provider);
  const allOn = providerIds.every((id) => isEnabled(state, id, universe));
  return allOn ? clearAll(state, providerIds, universe) : enableAll(state, providerIds, universe);
}

export function reorder(state: ScopedState, id: string, dir: -1 | 1): ScopedState {
  if (state.enabled === null) return state;
  const list = [...state.enabled];
  const index = list.indexOf(id);
  if (index < 0) return { enabled: list };
  const next = index + dir;
  if (next < 0 || next >= list.length) return { enabled: list };
  [list[index], list[next]] = [list[next]!, list[index]!];
  return { enabled: list };
}
