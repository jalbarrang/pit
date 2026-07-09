import { StyledText, TextAttributes, fg, type TextChunk } from "@opentui/core";
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

export function buildEditorContent(view: Viewport, options: ContentOptions): StyledText {
  const pad = " ".repeat(options.paddingX);
  const barText = "─".repeat(options.width);
  const bar = (text: string): TextChunk => options.borderColor ? fg(options.borderColor)(text) : plain(text);
  const chunks: TextChunk[] = [bar(barText), plain("\n")];
  view.lines.forEach((line, row) => {
    if (options.focused && row === view.cursorRow) {
      const seg = splitAtCursor(line, view.cursorCol);
      chunks.push(plain(pad + seg.before), inverted(seg.at), plain(seg.after + "\n"));
    } else {
      chunks.push(plain(pad + line + "\n"));
    }
  });
  chunks.push(bar(barText));
  for (const extra of options.extraLines ?? []) chunks.push(plain("\n" + extra));
  return new StyledText(chunks);
}
