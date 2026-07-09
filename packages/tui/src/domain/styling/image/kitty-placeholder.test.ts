import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildKittyDeleteEscape, buildKittyPlacementEscape, buildKittyTransmissionEscapes, kittyPlaceholderRows, prepareKittyImage } from "./index.ts";

const esc = "\x1b";
const st = "\x1b\\";
const ph = String.fromCodePoint(0x10eeee);

describe("kitty image Unicode placeholders", () => {
  it("assembles exact PNG transmission escape bytes", () => {
    const data = new Uint8Array(Buffer.from("hi"));
    assert.equal(buildKittyTransmissionEscapes({ format: "png", data }, 42), `${esc}_Ga=t,f=100,i=42,q=2,m=0;aGk=${st}`);
  });

  it("chunks base64 payloads at the protocol 4096-byte boundary", () => {
    const data = new Uint8Array(3073);
    const output = buildKittyTransmissionEscapes({ format: "png", data }, 7);
    const chunks = output.split(st).filter(Boolean);
    assert.equal(chunks.length, 2);
    assert.match(chunks[0]!, /^\x1b_Ga=t,f=100,i=7,q=2,m=1;[A-Za-z0-9+/]{4096}$/);
    assert.match(chunks[1]!, /^\x1b_Gq=2,m=0;[A-Za-z0-9+/=]{4}$/);
  });

  it("assembles virtual placement and delete escapes in quiet mode", () => {
    assert.equal(buildKittyPlacementEscape(42, { columns: 2, rows: 3 }), `${esc}_Ga=p,U=1,i=42,c=2,r=3,q=2;${st}`);
    assert.equal(buildKittyDeleteEscape(42), `${esc}_Ga=d,d=I,i=42,q=2;${st}`);
  });

  it("passes original PNG bytes through without re-encoding", () => {
    const data = "iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAQAAADYJv7S";
    const prepared = prepareKittyImage(data, "image/png");
    assert.deepEqual(prepared?.dimensions, { widthPx: 2, heightPx: 1 });
    assert.deepEqual([...(prepared?.source.data ?? [])], [...Buffer.from(data, "base64")]);
  });

  it("uses raw RGBA controls for decoded non-PNG input", () => {
    const data = new Uint8Array([1, 2, 3, 4]);
    assert.equal(buildKittyTransmissionEscapes({ format: "rgba", widthPx: 1, heightPx: 1, data }, 9), `${esc}_Ga=t,f=32,s=1,v=1,i=9,q=2,m=0;AQIDBA==${st}`);
  });

  it("encodes row/column diacritics and 24-bit image id in fg color", () => {
    const rows = kittyPlaceholderRows(0x123456, { columns: 2, rows: 2 });
    assert.equal(rows[0]!.chunks[0]!.text, `${ph}\u0305\u0305`);
    assert.equal(rows[1]!.chunks[1]!.text, `${ph}\u030d\u030d`);
    assert.deepEqual(rows[0]!.chunks[0]!.fg, { r: 0x12, g: 0x34, b: 0x56, a: 255 });
  });
});
