import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyFocusTransition, transitionFocus } from "./index.ts";

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
});
