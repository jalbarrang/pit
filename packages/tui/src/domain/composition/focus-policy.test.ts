import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFocusTransition, restoreFocusTarget, topVisibleCapturingOverlay, transitionFocus } from "./index.ts";

describe("FocusPolicy", () => {
  it("does nothing when target is unchanged", () => {
    const target = { focused: true };
    const transition = transitionFocus(target, target);
    assert.deepEqual(transition, { blur: null, focus: null, changed: false });
  });

  it("moves the focused flag from current to next target", () => {
    const current = { focused: true };
    const next = { focused: false };
    applyFocusTransition(transitionFocus(current, next));
    assert.equal(current.focused, false);
    assert.equal(next.focused, true);
  });

  it("allows focus to clear to null", () => {
    const current = { focused: true };
    applyFocusTransition(transitionFocus(current, null));
    assert.equal(current.focused, false);
  });

  it("chooses the topmost visible capturing overlay", () => {
    const result = topVisibleCapturingOverlay([
      { target: "base", hidden: false, focusOrder: 1 },
      { target: "hidden", hidden: true, focusOrder: 3 },
      { target: "non-capturing", hidden: false, nonCapturing: true, focusOrder: 4 },
      { target: "top", hidden: false, visible: true, focusOrder: 2 },
    ]);
    assert.equal(result, "top");
  });

  it("walks past hidden overlay parents when restoring focus", () => {
    assert.equal(restoreFocusTarget("a", [
      { target: "a", hidden: true, focusOrder: 1, preFocus: "editor" },
    ]), "editor");
  });
});
