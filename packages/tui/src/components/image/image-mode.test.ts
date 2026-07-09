import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { TerminalCapabilities } from "@opentui/core";
import { canUseKittyGraphics, imageMaxWidth } from "./image-mode.ts";

const caps = (kitty_graphics: boolean): TerminalCapabilities => ({ kitty_graphics }) as TerminalCapabilities;

describe("image rendering mode", () => {
  it("uses kitty placeholders only when opentui reports kitty graphics support", () => {
    assert.equal(canUseKittyGraphics(caps(true)), true);
    assert.equal(canUseKittyGraphics(caps(false)), false);
    assert.equal(canUseKittyGraphics(null), false);
  });

  it("defaults quadrant fallback sizing to the renderer width instead of a small cap", () => {
    assert.equal(imageMaxWidth({ width: 120 } as never, undefined), 120);
    assert.equal(imageMaxWidth({ width: 120 } as never, 40), 40);
  });
});
