import type { Renderable, RenderContext } from "@opentui/core";
import { Component, Text, type TextContent } from "@pit/tui";
import type { PitTheme } from "../domain/theming/index.ts";
import { formatFooter, formatFooterPlain, type FooterInfo } from "./footer-format.ts";
import { applyFooterTheme, createFooterParts, setFooterContentVisible, type FooterParts } from "./footer-render.ts";

type TextLike = Renderable & { content: TextContent; fg?: unknown; options?: Record<string, unknown> };

export class FooterComponent extends Component {
  readonly renderable: Renderable;
  private readonly legacyText?: Text;
  private readonly parts?: FooterParts;
  private lastInfo: FooterInfo | null = null;

  constructor(ctx: RenderContext, theme: PitTheme, renderable?: TextLike) {
    super();
    if (renderable) {
      this.legacyText = new Text(ctx, "", 1, 0, { fg: theme.color("muted") }, renderable);
      this.renderable = this.legacyText.renderable;
      return;
    }
    this.parts = createFooterParts(ctx);
    this.renderable = this.parts.root;
    applyFooterTheme(this.parts, theme);
  }

  update(info: FooterInfo): void {
    this.lastInfo = info;
    if (this.legacyText) return this.legacyText.setText(formatFooterPlain(info));
    const chips = formatFooter(info);
    this.setChip(this.parts!.branch, chips.branch);
    this.setChip(this.parts!.cwd, chips.cwd);
    this.setChip(this.parts!.model, chips.model);
    this.setChip(this.parts!.usage, chips.usage);
  }

  notice(text: string): void {
    if (this.legacyText) return this.legacyText.setText(text);
    this.parts!.notice.content = text;
    setFooterContentVisible(this.parts!, false);
    this.parts!.notice.visible = true;
  }

  clearNotice(): void {
    if (this.legacyText) {
      this.legacyText.setText(this.lastInfo === null ? "" : formatFooterPlain(this.lastInfo));
      return;
    }
    this.parts!.notice.visible = false;
    setFooterContentVisible(this.parts!, true);
  }

  applyTheme(theme: PitTheme): void {
    if (this.legacyText) {
      const renderable = this.legacyText.renderable as TextLike;
      renderable.fg = theme.color("muted");
      renderable.options = { ...renderable.options, fg: theme.color("muted") };
      return;
    }
    applyFooterTheme(this.parts!, theme);
  }

  getText(): string {
    if (this.legacyText) return String(this.legacyText.getText());
    return this.lastInfo === null ? "" : formatFooterPlain(this.lastInfo);
  }

  private setChip(chip: FooterParts["branch"], text: string): void {
    chip.content = text;
    chip.visible = text.length > 0;
  }
}
