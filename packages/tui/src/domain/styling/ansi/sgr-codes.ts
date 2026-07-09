import { ansi16Bg, ansi16Fg, ansi256ToRgba, rgbToRgba } from "./palette-256.ts";
import { ATTR, type StyleState } from "./types.ts";

const set = (state: StyleState, bit: number, on: boolean): void => {
  state.attributes = on ? state.attributes | bit : state.attributes & ~bit;
};

const resetAttrs = (state: StyleState): void => {
  state.attributes = ATTR.NONE;
  state.fg = undefined;
  state.bg = undefined;
};

export function applySgr(state: StyleState, params: number[]): void {
  if (params.length === 0 || (params.length === 1 && params[0] === 0)) {
    resetAttrs(state);
    return;
  }
  let i = 0;
  while (i < params.length) {
    const code = params[i]!;
    if (code === 38 || code === 48) {
      i = applyColor(state, code, params, i);
      continue;
    }
    applyAttr(state, code);
    i += 1;
  }
}

function applyColor(state: StyleState, code: number, params: number[], i: number): number {
  const mode = params[i + 1];
  if (mode === 5 && params[i + 2] !== undefined) {
    const color = ansi256ToRgba(params[i + 2]!);
    if (code === 38) state.fg = color; else state.bg = color;
    return i + 3;
  }
  if (mode === 2 && params[i + 4] !== undefined) {
    const color = rgbToRgba(params[i + 2]!, params[i + 3]!, params[i + 4]!);
    if (code === 38) state.fg = color; else state.bg = color;
    return i + 5;
  }
  return i + 1;
}

function applyAttr(state: StyleState, code: number): void {
  switch (code) {
    case 0: resetAttrs(state); break;
    case 1: set(state, ATTR.BOLD, true); break;
    case 2: set(state, ATTR.DIM, true); break;
    case 3: set(state, ATTR.ITALIC, true); break;
    case 4: set(state, ATTR.UNDERLINE, true); break;
    case 7: set(state, ATTR.INVERSE, true); break;
    case 9: set(state, ATTR.STRIKETHROUGH, true); break;
    case 22: set(state, ATTR.BOLD, false); set(state, ATTR.DIM, false); break;
    case 23: set(state, ATTR.ITALIC, false); break;
    case 24: set(state, ATTR.UNDERLINE, false); break;
    case 27: set(state, ATTR.INVERSE, false); break;
    case 29: set(state, ATTR.STRIKETHROUGH, false); break;
    case 39: state.fg = undefined; break;
    case 49: state.bg = undefined; break;
    default:
      if ((code >= 30 && code <= 37) || (code >= 90 && code <= 97)) state.fg = ansi16Fg(code);
      else if ((code >= 40 && code <= 47) || (code >= 100 && code <= 107)) state.bg = ansi16Bg(code);
  }
}
