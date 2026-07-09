import { RGBA, StyledText, type TextChunk } from "@opentui/core";
import type { AnsiChunk, AnsiColor } from "../../domain/styling/ansi/index.ts";

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
