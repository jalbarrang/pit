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
