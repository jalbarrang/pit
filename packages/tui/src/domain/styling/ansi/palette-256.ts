import type { AnsiColor } from "./types.ts";

const ANSI16: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0, 0], [128, 0, 0], [0, 128, 0], [128, 128, 0],
  [0, 0, 128], [128, 0, 128], [0, 128, 128], [192, 192, 192],
  [128, 128, 128], [255, 0, 0], [0, 255, 0], [255, 255, 0],
  [0, 0, 255], [255, 0, 255], [0, 255, 255], [255, 255, 255],
];

const CUBE = [0, 95, 135, 175, 215, 255] as const;

export const rgba = (r: number, g: number, b: number, a = 1): AnsiColor => ({ r, g, b, a });

export function ansi256ToRgba(index: number): AnsiColor {
  const n = Math.max(0, Math.min(255, index | 0));
  if (n < 16) {
    const [r, g, b] = ANSI16[n]!;
    return rgba(r / 255, g / 255, b / 255);
  }
  if (n < 232) {
    const cube = n - 16;
    return rgba(CUBE[Math.floor(cube / 36)]! / 255, CUBE[Math.floor(cube / 6) % 6]! / 255, CUBE[cube % 6]! / 255);
  }
  const v = (8 + (n - 232) * 10) / 255;
  return rgba(v, v, v);
}

export function ansi16Fg(code: number): AnsiColor {
  return ansi256ToRgba(code >= 90 ? code - 90 + 8 : code - 30);
}

export function ansi16Bg(code: number): AnsiColor {
  return ansi256ToRgba(code >= 100 ? code - 100 + 8 : code - 40);
}

export function rgbToRgba(r: number, g: number, b: number): AnsiColor {
  return rgba(r / 255, g / 255, b / 255);
}
