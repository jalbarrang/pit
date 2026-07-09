import { RGBA, StyledText, type TextChunk } from "@opentui/core";
import { type AnsiChunk, type AnsiColor, parseAnsiLine } from "../../domain/styling/ansi/index.ts";

const toRgba = (color?: AnsiColor): RGBA | undefined =>
  color ? RGBA.fromValues(color.r, color.g, color.b, color.a) : undefined;

export function ansiChunksToStyledText(chunks: AnsiChunk[]): StyledText {
  const mapped: TextChunk[] = chunks.map((chunk) => ({
    __isChunk: true,
    text: chunk.text,
    fg: toRgba(chunk.fg),
    bg: toRgba(chunk.bg),
    attributes: chunk.attributes,
    link: chunk.link,
  }));
  return new StyledText(mapped);
}

/**
 * Parse a possibly multi-line ANSI string into a StyledText: SGR becomes styled
 * chunks and every other escape (kitty graphics, OSC, cursor moves) is dropped,
 * so raw terminal output can be shown safely instead of leaking escape bytes.
 */
export function ansiTextToStyledText(text: string): StyledText {
  const chunks: TextChunk[] = [];
  text.split("\n").forEach((line, index) => {
    if (index > 0) chunks.push({ __isChunk: true, text: "\n" });
    chunks.push(...ansiChunksToStyledText(parseAnsiLine(line)).chunks);
  });
  return new StyledText(chunks);
}
