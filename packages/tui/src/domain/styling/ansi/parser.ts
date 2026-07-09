import { extractEscape, parseOsc8 } from "./escape.ts";
import { applySgr } from "./sgr-codes.ts";
import { ATTR, type AnsiChunk, type StyleState } from "./types.ts";

export type { AnsiChunk, AnsiColor, StyleState } from "./types.ts";
export { ATTR } from "./types.ts";
export { ansi256ToRgba, ansi16Fg, ansi16Bg, rgbToRgba } from "./palette-256.ts";

const snapshot = (state: StyleState): Omit<AnsiChunk, "text" | "__isChunk"> => ({
  ...(state.fg ? { fg: { ...state.fg } } : {}),
  ...(state.bg ? { bg: { ...state.bg } } : {}),
  ...(state.attributes ? { attributes: state.attributes } : {}),
  ...(state.link ? { link: { ...state.link } } : {}),
});

const pushText = (chunks: AnsiChunk[], text: string, state: StyleState): void => {
  if (!text) return;
  const last = chunks[chunks.length - 1];
  const style = snapshot(state);
  if (last && sameStyle(last, style)) {
    last.text += text;
    return;
  }
  chunks.push({ __isChunk: true, text, ...style });
};

const sameStyle = (chunk: AnsiChunk, style: Omit<AnsiChunk, "text" | "__isChunk">): boolean =>
  chunk.attributes === style.attributes &&
  chunk.fg?.r === style.fg?.r && chunk.fg?.g === style.fg?.g && chunk.fg?.b === style.fg?.b &&
  chunk.bg?.r === style.bg?.r && chunk.bg?.g === style.bg?.g && chunk.bg?.b === style.bg?.b &&
  chunk.link?.url === style.link?.url;

export function parseAnsiLine(line: string): AnsiChunk[] {
  const chunks: AnsiChunk[] = [];
  const state: StyleState = { attributes: ATTR.NONE };
  let i = 0;
  let plain = "";
  while (i < line.length) {
    const esc = extractEscape(line, i);
    if (!esc) {
      plain += line[i]!;
      i += 1;
      continue;
    }
    pushText(chunks, plain, state);
    plain = "";
    applyEscape(state, esc.code);
    i += esc.length;
  }
  pushText(chunks, plain, state);
  return chunks.length ? chunks : [{ __isChunk: true, text: "" }];
}

function applyEscape(state: StyleState, code: string): void {
  const osc8 = parseOsc8(code);
  if (osc8 !== undefined) {
    state.link = osc8 ?? undefined;
    return;
  }
  if (!code.endsWith("m") || !code.startsWith("\x1b[")) return;
  const body = code.slice(2, -1);
  const params = body === "" ? [0] : body.split(";").map((p) => Number.parseInt(p, 10) || 0);
  applySgr(state, params);
}
