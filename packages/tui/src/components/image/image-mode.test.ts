import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TerminalCapabilities } from "@opentui/core";
import { canUseKittyGraphics, imageCellLimits } from "./image-mode.ts";

const caps = (kitty_graphics: boolean): TerminalCapabilities => ({ kitty_graphics }) as TerminalCapabilities;
const ctx = (width: number, height: number) => ({ width, height }) as never;

describe("image rendering mode", () => {
  it("uses kitty placeholders only when opentui reports kitty graphics support", () => {
    assert.equal(canUseKittyGraphics(caps(true)), true);
    assert.equal(canUseKittyGraphics(caps(false)), false);
    assert.equal(canUseKittyGraphics(null), false);
  });

  it("caps default size at 72x24 cells on large terminals", () => {
    assert.deepEqual(imageCellLimits(ctx(200, 60)), { maxWidth: 72, maxHeight: 24 });
  });

  it("shrinks defaults to fit small terminals", () => {
    // width bounded by terminal minus margin; height by ~60% of viewport
    assert.deepEqual(imageCellLimits(ctx(50, 20)), { maxWidth: 48, maxHeight: 12 });
  });

  it("respects explicit overrides", () => {
    assert.deepEqual(imageCellLimits(ctx(200, 60), { maxWidthCells: 100, maxHeightCells: 40 }), { maxWidth: 100, maxHeight: 40 });
  });

  it("never returns less than one cell", () => {
    assert.deepEqual(imageCellLimits(ctx(0, 0)), { maxWidth: 1, maxHeight: 1 });
  });
});
