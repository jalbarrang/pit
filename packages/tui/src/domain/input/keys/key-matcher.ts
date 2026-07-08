import { ARROW, CP, FN, normalizeFunctional, normalizeShiftedLetter, SYMBOLS } from "./codepoints.ts";
import { parseKittySequence } from "./kitty.ts";
import { LEGACY } from "./legacy.ts";
import { MOD, parseKeyId } from "./modifiers.ts";
import { matchesModifyOtherKeys, parseModifyOtherKeys } from "./modify-other.ts";
import { isKittyProtocolActive } from "./state.ts";

const rawCtrlChar = (key: string): string | null => {
  const code = key.toLowerCase().charCodeAt(0);
  if ((code >= 97 && code <= 122) || "[\\]_".includes(key)) return String.fromCharCode(code & 0x1f);
  return key === "-" ? String.fromCharCode(31) : null;
};
const isWindowsTerminal = () => Boolean(process.env.WT_SESSION) && !process.env.SSH_CONNECTION && !process.env.SSH_CLIENT && !process.env.SSH_TTY;
const matchesRawBackspace = (data: string, modifier: number): boolean => data === "\x7f" ? modifier === 0 : data === "\x08" && (isWindowsTerminal() ? modifier === MOD.ctrl : modifier === 0);
const expectedCodepoint = (key: string): number | undefined => ({ escape: CP.escape, esc: CP.escape, tab: CP.tab, enter: CP.enter, return: CP.enter, space: CP.space, backspace: CP.backspace, delete: FN.delete, insert: FN.insert, home: FN.home, end: FN.end, pageup: FN.pageUp, pagedown: FN.pageDown, up: ARROW.up, down: ARROW.down, left: ARROW.left, right: ARROW.right } as Record<string, number>)[key] ?? (key.length === 1 ? key.charCodeAt(0) : undefined);

const matchesKitty = (data: string, expected: number, modifier: number): boolean => {
  const parsed = parseKittySequence(data);
  if (!parsed || (parsed.modifier & 15) !== modifier) return false;
  const actual = normalizeShiftedLetter(normalizeFunctional(parsed.codepoint), parsed.modifier);
  const wanted = normalizeShiftedLetter(normalizeFunctional(expected), modifier);
  if (actual === wanted) return true;
  if (parsed.baseLayoutKey !== undefined && parsed.baseLayoutKey === expected) {
    const known = (actual >= 97 && actual <= 122) || SYMBOLS.has(String.fromCharCode(actual));
    return !known;
  }
  return false;
};

export const matchesKey = (data: string, keyId: string): boolean => {
  const parsed = parseKeyId(keyId);
  if (!parsed) return false;
  const { key, modifier } = parsed;
  if (key === "enter" || key === "return") return matchEnter(data, modifier);
  if (key === "tab") return (modifier === 0 && data === "\t") || (modifier === MOD.shift && data === "\x1b[Z") || matchCode(data, CP.tab, modifier);
  if (key === "escape" || key === "esc") return modifier === 0 && (data === "\x1b" || matchCode(data, CP.escape, 0));
  if (key === "backspace") return matchBackspace(data, modifier);
  const codepoint = expectedCodepoint(key);
  if (codepoint === undefined) return false;
  if (modifier === 0 && LEGACY[key]?.includes(data)) return true;
  if (key.length === 1) return matchPrintable(data, key, codepoint, modifier);
  return matchCode(data, codepoint, modifier);
};

const matchCode = (data: string, codepoint: number, modifier: number): boolean => matchesKitty(data, codepoint, modifier) || matchesModifyOtherKeys(data, codepoint, modifier);
const matchEnter = (data: string, modifier: number): boolean => {
  if (modifier === 0) return data === "\r" || (!isKittyProtocolActive() && data === "\n") || data === "\x1bOM" || matchCode(data, CP.enter, 0) || matchesKitty(data, CP.kpEnter, 0);
  if (modifier === MOD.shift && isKittyProtocolActive() && (data === "\x1b\r" || data === "\n")) return true;
  if (modifier === MOD.alt && !isKittyProtocolActive() && data === "\x1b\r") return true;
  return matchCode(data, CP.enter, modifier) || matchesKitty(data, CP.kpEnter, modifier);
};
const matchBackspace = (data: string, modifier: number): boolean => modifier === MOD.alt ? data === "\x1b\x7f" || data === "\x1b\b" || matchCode(data, CP.backspace, MOD.alt) : matchesRawBackspace(data, modifier) || matchCode(data, CP.backspace, modifier);
const matchPrintable = (data: string, key: string, codepoint: number, modifier: number): boolean => {
  const rawCtrl = rawCtrlChar(key);
  if (modifier === MOD.ctrl && rawCtrl && data === rawCtrl) return true;
  if (modifier === (MOD.ctrl | MOD.alt) && rawCtrl && !isKittyProtocolActive() && data === `\x1b${rawCtrl}`) return true;
  if (modifier === MOD.alt && !isKittyProtocolActive() && /^[a-z0-9]$/.test(key) && data === `\x1b${key}`) return true;
  if (modifier === MOD.shift && /^[a-z]$/.test(key) && data === key.toUpperCase()) return true;
  return modifier === 0 ? data === key || matchesKitty(data, codepoint, 0) : matchCode(data, codepoint, modifier);
};
