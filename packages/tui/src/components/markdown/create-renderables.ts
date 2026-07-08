import {
  BoxRenderable,
  MarkdownRenderable,
  SyntaxStyle,
  type RenderContext,
} from "@opentui/core";
import { markdownThemeToSyntaxStyles } from "../../domain/styling/markdown-theme.ts";
import { createCodeBlockRenderNode } from "./code-blocks.ts";
import type { DefaultTextStyle, MarkdownTheme } from "./theme.ts";

export type MarkdownLike = {
  content: string;
  streaming?: boolean;
  options?: Record<string, unknown>;
  requestRender?(): void;
};

type BoxLike = { options?: Record<string, unknown>; add(child: unknown): number };

export const createBox = (ctx: RenderContext, paddingX: number, paddingY: number): BoxLike =>
  new BoxRenderable(ctx, {
    flexDirection: "column",
    width: "100%",
    height: "auto",
    border: false,
    paddingX,
    paddingY,
  }) as BoxLike;

export const createMarkdown = (
  ctx: RenderContext,
  text: string,
  theme: MarkdownTheme,
  defaultTextStyle?: DefaultTextStyle,
): MarkdownLike =>
  new MarkdownRenderable(ctx, {
    content: text,
    width: "100%",
    height: "auto",
    syntaxStyle: SyntaxStyle.fromStyles(markdownThemeToSyntaxStyles(theme, defaultTextStyle) as never),
    streaming: false,
    renderNode: createCodeBlockRenderNode(ctx),
  }) as MarkdownLike;
