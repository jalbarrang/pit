import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { matchesKey, parseKey, setKittyProtocolActive } from "./index.ts";

/** Real alt+up encodings derived from kitty.ts (CSI 1;3A + CSI-u 57419;3u). */
const ALT_UP_SEQUENCES = ["\x1b[1;3A", "\x1b[57419;3u"] as const;

describe("alt+up matching", () => {
  for (const mode of [false, true]) {
    it(`matchesKey recognizes every parser-supported alt+up encoding (kitty=${mode})`, () => {
      setKittyProtocolActive(mode);
      for (const seq of ALT_UP_SEQUENCES) {
        assert.equal(parseKey(seq), "alt+up", `parseKey failed for ${JSON.stringify(seq)}`);
        assert.equal(matchesKey(seq, "alt+up"), true, `matchesKey failed for ${JSON.stringify(seq)}`);
      }
      setKittyProtocolActive(false);
    });
  }

  it("does not treat ESC-prefixed legacy arrow as alt+up (unsupported encoding)", () => {
    setKittyProtocolActive(false);
    assert.equal(parseKey("\x1b\x1b[A"), undefined);
    assert.equal(matchesKey("\x1b\x1b[A", "alt+up"), false);
  });
});
