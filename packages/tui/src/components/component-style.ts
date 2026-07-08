import { TextAttributes, type StyleAttrs } from "@opentui/core";

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
