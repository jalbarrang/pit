import type { DefaultTextStyle, MarkdownTheme } from "@pit/tui";
import type { PitTheme } from "./types.ts";

export const getMarkdownTheme = (theme: PitTheme): MarkdownTheme => ({
  heading: { fg: theme.color("mdHeading"), bold: true },
  link: { fg: theme.color("mdLink"), underline: true },
  linkUrl: { fg: theme.color("mdLinkUrl"), underline: true },
  code: { fg: theme.color("mdCode") },
  codeBlock: { fg: theme.color("mdCodeBlock") },
  codeBlockBorder: { fg: theme.color("mdCodeBlockBorder") },
  quote: { fg: theme.color("mdQuote"), italic: true },
  quoteBorder: { fg: theme.color("mdQuoteBorder") },
  hr: { fg: theme.color("mdHr") },
  listBullet: { fg: theme.color("mdListBullet") },
  bold: { bold: true },
  italic: { italic: true },
  strikethrough: { strikethrough: true },
  underline: { underline: true },
});

export const getDefaultTextStyle = (theme: PitTheme): DefaultTextStyle => ({ fg: theme.color("text") });
