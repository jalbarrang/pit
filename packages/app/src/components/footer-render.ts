import { BoxRenderable, TextAttributes, TextRenderable, type RenderContext } from "@opentui/core";
import type { PitTheme } from "../domain/theming/index.ts";

export type FooterParts = {
  root: BoxRenderable;
  brand: TextRenderable;
  branch: TextRenderable;
  cwd: TextRenderable;
  spacer: BoxRenderable;
  model: TextRenderable;
  usage: TextRenderable;
  notice: TextRenderable;
};

const segment = (ctx: RenderContext, content = "", shrink = false): TextRenderable => new TextRenderable(ctx, {
  content,
  width: "auto",
  height: 1,
  minWidth: shrink ? 0 : undefined,
  flexShrink: shrink ? 1 : 0,
  paddingX: 1,
  wrapMode: "none",
  truncate: true,
});

export const createFooterParts = (ctx: RenderContext): FooterParts => {
  const root = new BoxRenderable(ctx, { flexDirection: "row", width: "100%", height: 1, border: false });
  const parts: FooterParts = {
    root,
    brand: segment(ctx, "pit"),
    branch: segment(ctx, "", true),
    cwd: segment(ctx, "", true),
    spacer: new BoxRenderable(ctx, { flexGrow: 1, height: 1, border: false }),
    model: segment(ctx, "", true),
    usage: segment(ctx),
    notice: new TextRenderable(ctx, { content: "", width: "100%", height: 1, paddingX: 1 }),
  };
  for (const part of [parts.brand, parts.branch, parts.cwd, parts.spacer, parts.model, parts.usage, parts.notice]) root.add(part);
  parts.notice.visible = false;
  return parts;
};

export const applyFooterTheme = (parts: FooterParts, theme: PitTheme): void => {
  parts.root.backgroundColor = theme.color("statusBarBg");
  parts.spacer.backgroundColor = theme.color("statusBarBg");
  parts.brand.fg = theme.color("background");
  parts.brand.bg = theme.color("chipBrandBg");
  parts.brand.attributes = TextAttributes.BOLD;
  parts.branch.fg = theme.color("text");
  parts.branch.bg = theme.color("chipRaisedBg");
  parts.cwd.fg = theme.color("muted");
  parts.cwd.bg = theme.color("chipMutedBg");
  parts.model.fg = theme.color("interactive");
  parts.model.bg = theme.color("chipMutedBg");
  parts.usage.fg = theme.color("muted");
  parts.usage.bg = theme.color("chipRaisedBg");
  parts.notice.fg = theme.color("muted");
  parts.notice.bg = theme.color("statusBarBg");
};

export const setFooterContentVisible = (parts: FooterParts, visible: boolean): void => {
  for (const part of [parts.brand, parts.branch, parts.cwd, parts.spacer, parts.model, parts.usage]) part.visible = visible;
};
