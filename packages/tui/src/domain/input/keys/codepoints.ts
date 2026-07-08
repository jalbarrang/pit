export const CP = { escape: 27, tab: 9, enter: 13, space: 32, backspace: 127, kpEnter: 57414 } as const;
export const ARROW = { up: -1, down: -2, right: -3, left: -4 } as const;
export const FN = { delete: -10, insert: -11, pageUp: -12, pageDown: -13, home: -14, end: -15 } as const;
export const SYMBOLS = new Set("`-=[]\\;',./!@#$%^&*()_+|~{}:<>?".split(""));
const keypad = new Map<number, number>([
  [57399, 48], [57400, 49], [57401, 50], [57402, 51], [57403, 52],
  [57404, 53], [57405, 54], [57406, 55], [57407, 56], [57408, 57],
  [57409, 46], [57410, 47], [57411, 42], [57412, 45], [57413, 43],
  [57415, 61], [57416, 44], [57417, ARROW.left], [57418, ARROW.right],
  [57419, ARROW.up], [57420, ARROW.down], [57421, FN.pageUp],
  [57422, FN.pageDown], [57423, FN.home], [57424, FN.end],
  [57425, FN.insert], [57426, FN.delete],
]);
export const normalizeFunctional = (codepoint: number): number => keypad.get(codepoint) ?? codepoint;
export const normalizeShiftedLetter = (codepoint: number, modifier: number): number => {
  if ((modifier & 1) !== 0 && codepoint >= 65 && codepoint <= 90) return codepoint + 32;
  return codepoint;
};
