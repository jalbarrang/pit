export type FocusTarget = { focused?: boolean } | null;
export interface FocusTransition {
  blur: FocusTarget;
  focus: FocusTarget;
  changed: boolean;
}

export function transitionFocus(current: FocusTarget, next: FocusTarget): FocusTransition {
  if (current === next) return { blur: null, focus: null, changed: false };
  return { blur: current, focus: next, changed: true };
}

export function applyFocusTransition(transition: FocusTransition): void {
  if (transition.blur && "focused" in transition.blur) transition.blur.focused = false;
  if (transition.focus && "focused" in transition.focus) transition.focus.focused = true;
}

export interface OverlayFocusEntry<T> {
  target: T;
  hidden: boolean;
  nonCapturing?: boolean;
  visible?: boolean;
  focusOrder: number;
}

export function topVisibleCapturingOverlay<T>(entries: OverlayFocusEntry<T>[]): T | null {
  let best: OverlayFocusEntry<T> | null = null;
  for (const entry of entries) {
    if (entry.hidden || entry.nonCapturing || entry.visible === false) continue;
    if (!best || entry.focusOrder > best.focusOrder) best = entry;
  }
  return best?.target ?? null;
}
