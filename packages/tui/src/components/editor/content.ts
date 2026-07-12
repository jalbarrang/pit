import { StyledText, TextAttributes, fg, type TextChunk } from "@opentui/core";
import { visibleWidth } from "../../domain/styling/index.ts";
import { splitAtCursor, type Viewport } from "./viewport.ts";

export interface ContentOptions {
  width: number;
  paddingX: number;
  focused: boolean;
  borderColor?: string;
  extraLines?: string[];
}

export const plain = (text: string): TextChunk => ({ __isChunk: true, text });
// opentui 0.4.3's reverse() helper is a no-op ({ reverse } vs { inverse } mismatch), so build the chunk directly.
const inverted = (text: string): TextChunk => ({ __isChunk: true, text, attributes: TextAttributes.INVERSE });

const topBorder = (innerWidth: number): string => {
  const title = "─ message ";
  if (innerWidth < title.length) return `╭${"─".repeat(innerWidth)}╮`;
  return `╭${title}${"─".repeat(innerWidth - title.length)}╮`;
};

// The box always insets content by one cell on each side, on top of paddingX.
export const EDITOR_BOX_INSET = 1;

export function buildEditorContent(view: Viewport, options: ContentOptions): StyledText {
  const contentWidth = options.width + options.paddingX * 2;
  const innerWidth = contentWidth + EDITOR_BOX_INSET * 2;
  const inset = " ".repeat(EDITOR_BOX_INSET);
  const border = (text: string): TextChunk => options.borderColor ? fg(options.borderColor)(text) : plain(text);
  const chunks: TextChunk[] = [border(topBorder(innerWidth)), plain("\n")];
  view.lines.forEach((line, row) => {
    const focused = options.focused && row === view.cursorRow;
    const lineWidth = Math.max(visibleWidth(line), focused ? view.cursorCol + 1 : 0);
    const trailing = " ".repeat(Math.max(0, contentWidth - options.paddingX - lineWidth));
    chunks.push(border("│"), plain(inset + " ".repeat(options.paddingX)));
    if (focused) {
      const seg = splitAtCursor(line, view.cursorCol);
      chunks.push(plain(seg.before), inverted(seg.at), plain(seg.after));
    } else chunks.push(plain(line));
    chunks.push(plain(trailing + inset), border("│"), plain("\n"));
  });
  chunks.push(border(`╰${"─".repeat(innerWidth)}╯`));
  for (const extra of options.extraLines ?? []) chunks.push(plain("\n" + extra));
  return new StyledText(chunks);
}
