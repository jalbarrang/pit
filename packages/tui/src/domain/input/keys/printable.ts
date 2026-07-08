import { normalizeFunctional } from "./codepoints.ts";
import { MOD } from "./modifiers.ts";
import { parseKittySequence } from "./kitty.ts";
import { parseModifyOtherKeys } from "./modify-other.ts";

const allowed = MOD.shift | 64 | 128;

export const decodeKittyPrintable = (data: string): string | undefined => {
  const parsed = parseKittySequence(data);
  if (!parsed) return undefined;
  if ((parsed.modifier & ~allowed) !== 0) return undefined;
  let codepoint = parsed.codepoint;
  if ((parsed.modifier & MOD.shift) !== 0 && parsed.shiftedKey !== undefined) codepoint = parsed.shiftedKey;
  return toPrintable(normalizeFunctional(codepoint));
};

export const decodePrintableKey = (data: string): string | undefined => {
  const kitty = decodeKittyPrintable(data);
  if (kitty) return kitty;
  const other = parseModifyOtherKeys(data);
  if (!other || (other.modifier & ~MOD.shift) !== 0) return undefined;
  return toPrintable(other.codepoint);
};

const toPrintable = (codepoint: number): string | undefined => {
  if (!Number.isFinite(codepoint) || codepoint < 32) return undefined;
  try {
    return String.fromCodePoint(codepoint);
  } catch {
    return undefined;
  }
};
