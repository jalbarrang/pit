import { ARROW, CP, FN, normalizeFunctional, normalizeShiftedLetter, SYMBOLS } from "./codepoints.ts";
import { formatWithModifiers, LOCK_MASK } from "./modifiers.ts";

export const printableCodepoint = (codepoint: number): string | undefined => {
  if (codepoint >= 48 && codepoint <= 57) return String.fromCharCode(codepoint);
  if (codepoint >= 97 && codepoint <= 122) return String.fromCharCode(codepoint);
  const symbol = String.fromCharCode(codepoint);
  return SYMBOLS.has(symbol) ? symbol : undefined;
};

export const keyNameForCodepoint = (codepoint: number): string | undefined => {
  if (codepoint === CP.escape) return "escape";
  if (codepoint === CP.tab) return "tab";
  if (codepoint === CP.enter || codepoint === CP.kpEnter) return "enter";
  if (codepoint === CP.space) return "space";
  if (codepoint === CP.backspace) return "backspace";
  if (codepoint === FN.delete) return "delete";
  if (codepoint === FN.insert) return "insert";
  if (codepoint === FN.home) return "home";
  if (codepoint === FN.end) return "end";
  if (codepoint === FN.pageUp) return "pageUp";
  if (codepoint === FN.pageDown) return "pageDown";
  if (codepoint === ARROW.up) return "up";
  if (codepoint === ARROW.down) return "down";
  if (codepoint === ARROW.left) return "left";
  if (codepoint === ARROW.right) return "right";
  return printableCodepoint(codepoint);
};

export const formatParsedKey = (codepoint: number, modifier: number, baseLayoutKey?: number): string | undefined => {
  const normalized = normalizeFunctional(codepoint);
  const identity = normalizeShiftedLetter(normalized, modifier);
  const printable = printableCodepoint(identity);
  const effective = printable ? identity : baseLayoutKey ?? identity;
  const key = keyNameForCodepoint(effective);
  return key ? formatWithModifiers(key, modifier & ~LOCK_MASK) : undefined;
};
