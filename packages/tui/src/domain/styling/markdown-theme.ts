import type { DefaultTextStyle, MarkdownTheme, SyntaxStyleRecord } from "./markdown-theme-types.ts";
import { codeHighlightStyles } from "./code-highlight-styles.ts";

const headingLevels = (heading: MarkdownTheme["heading"]): SyntaxStyleRecord => ({
  "markup.heading": { ...heading },
  "markup.heading.1": { ...heading, bold: true, underline: true },
  "markup.heading.2": { ...heading, bold: true },
  "markup.heading.3": { ...heading, bold: true },
  "markup.heading.4": { ...heading },
  "markup.heading.5": { ...heading },
  "markup.heading.6": { ...heading },
});

export function markdownThemeToSyntaxStyles(
  theme: MarkdownTheme,
  defaultTextStyle?: DefaultTextStyle,
): SyntaxStyleRecord {
  return {
    ...(defaultTextStyle ? { default: { ...defaultTextStyle } } : {}),
    ...headingLevels(theme.heading),
    "markup.list": { ...theme.listBullet },
    "markup.strong": { ...theme.bold },
    "markup.bold": { ...theme.bold },
    "markup.italic": { ...theme.italic },
    "markup.strikethrough": { ...theme.strikethrough },
    "markup.raw": { ...theme.code },
    "markup.raw.inline": { ...theme.code },
    "markup.raw.block": { ...theme.codeBlock },
    "markup.quote": { ...theme.quote },
    "markup.link": { ...theme.link },
    "markup.link.label": { ...theme.link },
    "markup.link.url": { ...theme.linkUrl },
    conceal: { ...theme.codeBlockBorder },
    ...codeHighlightStyles(theme),
  };
}
