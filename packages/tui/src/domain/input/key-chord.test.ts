import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { Key, decodeKittyPrintable, isKeyRelease, matchesKey, parseKey, setKittyProtocolActive } from "./index.ts";

describe("KeyChord", () => {
  it("matches xterm modifyOtherKeys ctrl chords", () => {
    setKittyProtocolActive(false);
    assert.equal(matchesKey("\x1b[27;5;107~", "ctrl+k"), true);
    assert.equal(matchesKey("\x1b[27;5;99~", "ctrl+c"), true);
    assert.equal(matchesKey("\x1b[27;5;100~", "ctrl+d"), true);
    assert.equal(parseKey("\x1b[27;5;107~"), "ctrl+k");
  });

  it("matches representative legacy chords", () => {
    setKittyProtocolActive(false);
    assert.equal(matchesKey("\x03", "ctrl+c"), true);
    assert.equal(matchesKey("\x1f", "ctrl+-"), true);
    assert.equal(matchesKey("\x1b\x1d", "ctrl+alt+]"), true);
    assert.equal(matchesKey("\n", "enter"), true);
    assert.equal(parseKey("\x1b[Z"), "shift+tab");
  });

  it("parses kitty modifiers, alternate layout keys, and keypad aliases", () => {
    setKittyProtocolActive(true);
    assert.equal(matchesKey("\x1b[1089::99;5u", "ctrl+c"), true);
    assert.equal(matchesKey("\x1b[107;13u", Key.ctrlSuper("k")), true);
    assert.equal(parseKey("\x1b[107;14u"), "shift+ctrl+super+k");
    assert.equal(parseKey("\x1b[57417u"), "left");
    assert.equal(matchesKey("\x1b[49;5u", "ctrl+1"), true);
    setKittyProtocolActive(false);
  });

  it("detects release events and decodes printable CSI-u input", () => {
    assert.equal(isKeyRelease("\x1b[1089::99;5:3u"), true);
    assert.equal(isKeyRelease("\x1b[200~90:62:3F\x1b[201~"), false);
    assert.equal(decodeKittyPrintable("\x1b[97u"), "a");
    assert.equal(decodeKittyPrintable("\x1b[97:65:97;2u"), "A");
  });
});
