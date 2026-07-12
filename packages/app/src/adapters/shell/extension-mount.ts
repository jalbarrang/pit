import type { RenderContext } from "@opentui/core";
import { Container, type Component } from "@pit/tui";
import { StatusIndicator } from "../../components/message/index.ts";
import type { PitTheme } from "../../domain/theming/index.ts";

export type WidgetPlacement = "aboveEditor" | "belowEditor";

export class ExtensionMount {
  readonly headerSlot: Container;
  readonly widgetAboveSlot: Container;
  readonly widgetBelowSlot: Container;
  readonly footerSlot: Container;
  private readonly above = new Map<string, Component>();
  private readonly below = new Map<string, Component>();
  private activeStatus?: StatusIndicator;
  private workingMessage = "thinking…";
  private workingVisible = true;
  private readonly footer: Component;
  private theme: PitTheme;

  constructor(ctx: RenderContext, footer: Component, theme: PitTheme) {
    this.footer = footer;
    this.theme = theme;
    this.headerSlot = new Container(ctx);
    this.widgetAboveSlot = new Container(ctx);
    this.widgetBelowSlot = new Container(ctx);
    this.footerSlot = new Container(ctx);
    this.footerSlot.addChild(footer);
  }

  mountHeader(component: Component | undefined): void { this.replace(this.headerSlot, component); }

  mountFooter(component: Component | undefined): void { this.replace(this.footerSlot, component ?? this.footer); }

  mountWidget(key: string, component: Component | undefined, placement: WidgetPlacement = "aboveEditor"): void {
    this.above.delete(key); this.below.delete(key);
    if (component) (placement === "belowEditor" ? this.below : this.above).set(key, component);
    this.renderWidgets();
  }

  applyTheme(theme: PitTheme): void {
    this.theme = theme;
    this.activeStatus?.applyTheme(theme);
  }

  setWorkingMessage(message?: string): void {
    this.workingMessage = message ?? "thinking…";
    this.activeStatus?.setLabel(this.workingMessage);
  }

  setWorkingVisible(visible: boolean): void {
    this.workingVisible = visible;
    if (!visible) this.activeStatus?.setLabel("");
  }

  createStatusIndicator(ctx: RenderContext): StatusIndicator | undefined {
    if (!this.workingVisible) return undefined;
    this.activeStatus = new StatusIndicator(ctx, this.theme, this.workingMessage);
    return this.activeStatus;
  }

  clearStatusIndicator(status: StatusIndicator | undefined): void {
    if (this.activeStatus === status) this.activeStatus = undefined;
  }

  private renderWidgets(): void {
    this.widgetAboveSlot.clear();
    this.widgetBelowSlot.clear();
    for (const widget of this.above.values()) this.widgetAboveSlot.addChild(widget);
    for (const widget of this.below.values()) this.widgetBelowSlot.addChild(widget);
  }

  private replace(slot: Container, component: Component | undefined): void {
    slot.clear();
    if (component) slot.addChild(component);
  }
}
