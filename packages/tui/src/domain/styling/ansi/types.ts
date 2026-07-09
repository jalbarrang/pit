/** Pure chunk shape structurally compatible with opentui TextChunk. */
export interface AnsiColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface AnsiChunk {
  __isChunk: true;
  text: string;
  fg?: AnsiColor;
  bg?: AnsiColor;
  attributes?: number;
  link?: { url: string };
}

export const ATTR = {
  NONE: 0,
  BOLD: 1,
  DIM: 2,
  ITALIC: 4,
  UNDERLINE: 8,
  BLINK: 16,
  INVERSE: 32,
  HIDDEN: 64,
  STRIKETHROUGH: 128,
} as const;

export interface StyleState {
  attributes: number;
  fg?: AnsiColor;
  bg?: AnsiColor;
  link?: { url: string };
}
