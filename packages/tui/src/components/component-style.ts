import { bg, fg, TextAttributes, type StyleAttrs, type TextChunk } from "@opentui/core";

export type PitStyle = StyleAttrs;

export const textAttributes = (style?: PitStyle): number | undefined => {
  if (!style) return undefined;
  let attributes = TextAttributes.NONE;
  if (style.bold) attributes |= TextAttributes.BOLD;
  if (style.italic) attributes |= TextAttributes.ITALIC;
  if (style.underline) attributes |= TextAttributes.UNDERLINE;
  if (style.strikethrough) attributes |= TextAttributes.STRIKETHROUGH;
  if (style.dim) attributes |= TextAttributes.DIM;
  if (style.reverse) attributes |= TextAttributes.INVERSE;
  if (style.blink) attributes |= TextAttributes.BLINK;
  return attributes;
};

export const textOptions = (style?: PitStyle): Record<string, unknown> => ({
  fg: style?.fg,
  bg: style?.bg,
  attributes: textAttributes(style),
});

/** Build a StyledText chunk from a PitStyle (fg/bg/attributes). */
export const styleChunk = (text: string, style?: PitStyle): TextChunk => {
  let chunk: TextChunk = { __isChunk: true, text };
  if (style?.fg !== undefined) chunk = fg(style.fg)(chunk);
  if (style?.bg !== undefined) chunk = bg(style.bg)(chunk);
  const attributes = textAttributes(style);
  if (attributes) chunk.attributes = (chunk.attributes ?? 0) | attributes;
  return chunk;
};
