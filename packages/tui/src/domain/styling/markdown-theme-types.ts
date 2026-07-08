/** Plain style attrs for markdown theming (mirrors StyleAttrs / PitStyle without importing adapters). */
export interface MarkdownStyle {
  fg?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  dim?: boolean;
  reverse?: boolean;
  blink?: boolean;
}

export interface MarkdownTheme {
  heading: MarkdownStyle;
  link: MarkdownStyle;
  linkUrl: MarkdownStyle;
  code: MarkdownStyle;
  codeBlock: MarkdownStyle;
  codeBlockBorder: MarkdownStyle;
  quote: MarkdownStyle;
  quoteBorder: MarkdownStyle;
  hr: MarkdownStyle;
  listBullet: MarkdownStyle;
  bold: MarkdownStyle;
  italic: MarkdownStyle;
  strikethrough: MarkdownStyle;
  underline: MarkdownStyle;
  codeBlockIndent?: string;
}

export interface DefaultTextStyle extends MarkdownStyle {}

export interface MarkdownOptions {
  preserveOrderedListMarkers?: boolean;
  preserveBackslashEscapes?: boolean;
}

export type SyntaxStyleRecord = Record<string, MarkdownStyle>;
